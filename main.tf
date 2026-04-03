provider "aws" {
    alias  = "us_east_1"
    region = "us-east-1"
}

provider "cloudflare" {
    api_token = var.cloudflare_api_token
}

# Look up your existing Cloudflare zone
data "cloudflare_zone" "cloud-resume-website" {
    name = "jeffxieresumewebsite.com"
}

# Root domain CNAME -> CloudFront
resource "cloudflare_record" "acm_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cloud-resume-website.domain_validation_options : dvo.domain_name => {
      name  = dvo.resource_record_name
      value = dvo.resource_record_value
      type  = dvo.resource_record_type
    }
  }

  zone_id = data.cloudflare_zone.cloud-resume-website.id
  name    = each.value.name
  type    = each.value.type
  value   = each.value.value
  ttl     = 60
  proxied = false  # must be false for ACM validation
}

resource "aws_acm_certificate_validation" "resume" {
  certificate_arn         = aws_acm_certificate.cloud-resume-website.arn
  validation_record_fqdns = [for record in cloudflare_record.acm_validation : record.hostname]
}

# ACM Certificate for root website
resource "aws_acm_certificate" "cloud-resume-website" {
    provider = aws.us_east_1
    domain_name = "jeffxieresumewebsie.com"
    validation_method = "DNS"

    lifecycle {
        create_before_destroy = true
    }
}

# ACM certificate for www prefix
resource "aws_acm_certificate" "cloud-resume-website-www" {
  provider = aws.us_east_1
  domain_name = "www.jeffxieresumewebsite.com"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_s3_bucket" "cloud-resume-challenge" {
    bucket = "test-cloud-resume-challenge"

    tags = {
        Name        = "My bucket"
        Environment = "Dev"
    }
}

# Block all public access - CloudFront will access via OAC
resource "aws_s3_bucket_public_access_block" "cloud-resume-challenge" {
    bucket = aws_s3_bucket.cloud-resume-challenge.id 
    block_public_acls = true
    block_public_policy = true
    ignore_public_acls = true
    restrict_public_buckets = true
}

# Origin Access Control for secure S3 access
resource "aws_cloudfront_origin_access_control" "s3_oac" {
    name = "s3-oac"
    description = "OAC for S3 website bucket"
    origin_access_control_origin_type = "s3"
    signing_behavior = "always"
    signing_protocol = "sigv4"
}

# Bucket policy allowing CloudFront access via OAC
resource "aws_s3_bucket_policy" "cloud-resume-challenge" {
  bucket = aws_s3_bucket.cloud-resume-challenge.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.cloud-resume-challenge.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.cloud-resume-website.arn
          }
        }
      }
    ]
  })
}

# CloudFront distribution serving from S3
resource "aws_cloudfront_distribution" "cloud-resume-website" {
    enabled = true
    is_ipv6_enabled = true
    default_root_object = "index.html"
    comment = "Website CDN"
    price_class = "PriceClass_100"

    aliases = ["jeffxieresumewebsite.com"]

    # S3 origin configuration
    origin {
        domain_name = aws_s3_bucket.cloud-resume-challenge.bucket_regional_domain_name
        origin_id = "s3-website"
        origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id 
    }

    # Default cache behavior
    default_cache_behavior {
        allowed_methods        = ["GET", "HEAD", "OPTIONS"]
        cached_methods         = ["GET", "HEAD"]
        target_origin_id       = "s3-website"
        viewer_protocol_policy = "redirect-to-https"

        # Use a managed cache policy
        cache_policy_id          = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized

        compress = true
    }

    # Custom error response for SPA routing
    custom_error_response {
        error_code         = 403
        response_code      = 200
        response_page_path = "/index.html"
    }

    custom_error_response {
        error_code         = 404
        response_code      = 200
        response_page_path = "/index.html"
    }

    restrictions {
        geo_restriction {
        restriction_type = "none"
        }
    }

    viewer_certificate {
        acm_certificate_arn = aws_acm_certificate_validation.resume.certificate_arn
        ssl_support_method = "sni-only"
        minimum_protocol_version = "TLSv1.2_2021"
    }

    tags = {
        Environment = "production"
        ManagedBy   = "terraform"
    }
}