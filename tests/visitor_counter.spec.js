// @ts-check
import { test, expect } from '@playwright/test';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

test.describe.configure({ mode: 'serial' });

test('has title', async ({ page }) => {
    await page.goto('https://www.jeffxieresumewebsite.com/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Jeff Xie/);
});

test('visitor counter increments', async ({ page }) => {
    let pageLoads = 0;

    await page.route('https://xt9kqsik74.execute-api.us-east-2.amazonaws.com/visitorCount', async (route) => {
        console.log('Mock intercepted GET visitorCount');
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ counter: 100, id: 'visitor-counter', name: 'Visitor Counter' }])
        });
    });

    await page.route('https://xt9kqsik74.execute-api.us-east-2.amazonaws.com/visitorCount/increment', async (route) => {
        console.log('Mock intercepted POST to increment');
        pageLoads++;
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([{ counter: pageLoads === 1 ? 100 : 101, id: 'visitor-counter', name: 'Visitor Counter' }])
        });
    });

    await page.goto('https://www.jeffxieresumewebsite.com/');
    await expect(page.locator('#visitor-count')).not.toHaveText('Loading...', { timeout: 30000 });
    const initialCount = parseInt(await page.getByTestId('visitor-count').textContent(), 10);

    await page.reload();
    await expect(page.locator('#visitor-count')).not.toHaveText('Loading...', { timeout: 30000 });
    const updatedCount = parseInt(await page.getByTestId('visitor-count').textContent(), 10);

    expect(updatedCount).toBeGreaterThan(initialCount); // 101 > 100
});
test.describe('DynamoDB integration', () => {
    test('visitor count in DynamoDB increments', async ({ page }) => {
        const client = new DynamoDBClient({ region: 'us-east-2' });
        const ddbDocClient = DynamoDBDocumentClient.from(client);

        await page.goto('https://www.jeffxieresumewebsite.com/');
        await expect(page.locator('#visitor-count')).not.toHaveText('Loading...', { timeout: 50000 });

        const websiteCount = parseInt(await page.getByTestId('visitor-count').textContent(), 10);

        // Now check DynamoDB matches what the site shows
        const data = await ddbDocClient.send(new GetCommand({
            TableName: 'visitor-counter',
            Key: { id: 'visitor-counter' },
        }));
        const dbCount = data.Item?.counter;

        console.log('Website count:', websiteCount, 'DynamoDB count:', dbCount);
        expect(websiteCount).toBe(dbCount);
    });
});