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

  zone_id         = data.cloudflare_zone.cloud-resume-website.id
  name            = each.value.name
  type            = each.value.type
  value           = each.value.value
  ttl             = 60
  proxied         = false # must be false for ACM validation
  allow_overwrite = true
}

# Root domain CloudFront -> Cloudflare
resource "cloudflare_record" "cloudfront_cloudflare_base" {
  zone_id         = data.cloudflare_zone.cloud-resume-website.id
  name            = "jeffxieresumewebsite.com"
  content         = aws_cloudfront_distribution.cloud-resume-website.domain_name
  type            = "CNAME"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}

# www domain CloudFront -> Cloudflare
resource "cloudflare_record" "cloudfront_cloudflare_www" {
  zone_id         = data.cloudflare_zone.cloud-resume-website.id
  name            = "www.jeffxieresumewebsite.com"
  content         = aws_cloudfront_distribution.cloud-resume-website.domain_name
  type            = "CNAME"
  proxied         = true
  ttl             = 1
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "resume" {
  certificate_arn         = aws_acm_certificate.cloud-resume-website.arn
  validation_record_fqdns = [for record in cloudflare_record.acm_validation : record.hostname]
}

# ACM Certificate for root website
resource "aws_acm_certificate" "cloud-resume-website" {
  provider                  = aws.us_east_1
  domain_name               = "jeffxieresumewebsite.com"
  subject_alternative_names = ["www.jeffxieresumewebsite.com"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# CloudFront distribution serving from S3
resource "aws_cloudfront_distribution" "cloud-resume-website" {
  web_acl_id          = "arn:aws:wafv2:us-east-1:533266979920:global/webacl/CreatedByCloudFront-f48b3443/1a79d996-461d-4fd6-a0bb-775715b4fd78"
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "Resume Website for Cloud Resume Challenge"
  price_class         = "PriceClass_All"

  aliases = ["jeffxieresumewebsite.com", "www.jeffxieresumewebsite.com"]

  # S3 origin configuration
  origin {
    domain_name = "jeffxieresumewebsite.com.s3-website.us-east-2.amazonaws.com"
    origin_id   = "jeffxieresumewebsite.com.s3.us-east-2.amazonaws.com-mmjjc4xckav"

    custom_origin_config {
      http_port                = 80
      https_port               = 443
      origin_keepalive_timeout = 5
      origin_protocol_policy   = "http-only"
      origin_ssl_protocols = [
        "TLSv1.2",
        "SSLv3",
        "TLSv1.1",
        "TLSv1"
      ]
      ip_address_type     = "ipv4"
      origin_read_timeout = 30
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "jeffxieresumewebsite.com.s3.us-east-2.amazonaws.com-mmjjc4xckav"
    viewer_protocol_policy = "redirect-to-https"

    # Use a managed cache policy
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # CachingOptimized
    default_ttl = 60
    compress = true
  }

  # Custom error response for SPA routing
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index_error.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index_error.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.resume.certificate_arn
    ssl_support_method             = "sni-only"
    cloudfront_default_certificate = true
    minimum_protocol_version       = "TLSv1"
  }

  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}