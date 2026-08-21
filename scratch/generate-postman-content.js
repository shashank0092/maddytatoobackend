const fs = require('fs');

const collection = {
  info: {
    name: "Maddy's Tattoo & Art - Main Content API",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: [
    {
      name: "Public API",
      item: [
        {
          name: "1. GET All Content",
          request: {
            method: "GET",
            url: {
              raw: "{{baseUrl}}/api/v1/contents?page=1&limit=20&lang=en",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents"],
              query: [
                { key: "page", value: "1" },
                { key: "limit", value: "20" },
                { key: "lang", value: "en" },
                { key: "search", value: "mahadev", disabled: true },
                { key: "contentType", value: "tattoo", disabled: true },
                { key: "category", value: "spiritual", disabled: true },
                { key: "collection", value: "mahadev", disabled: true },
                { key: "style", value: "realism", disabled: true },
                { key: "bodyPlacement", value: "forearm", disabled: true },
                { key: "tag", value: "shiva", disabled: true },
                { key: "sort", value: "latest" }
              ]
            }
          }
        },
        {
          name: "2. GET Content by Slug",
          request: {
            method: "GET",
            url: {
              raw: "{{baseUrl}}/api/v1/contents/mahadev-realism-tattoo?lang=en",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "mahadev-realism-tattoo"],
              query: [
                { key: "lang", value: "en" }
              ]
            }
          }
        }
      ]
    },
    {
      name: "Admin API",
      item: [
        {
          name: "3. POST Create Content",
          request: {
            method: "POST",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                slug: "new-tattoo-design",
                contentTypeId: "{{contentTypeId}}",
                categoryId: "{{categoryId}}",
                status: "DRAFT",
                translations: {
                  en: {
                    title: "New Tattoo Design",
                    description: "An amazing new design."
                  }
                }
              }, null, 2)
            }
          }
        },
        {
          name: "4. PATCH Update Basic Content",
          request: {
            method: "PATCH",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                translations: {
                  en: {
                    title: "Updated Tattoo Design"
                  }
                }
              }, null, 2)
            }
          }
        },
        {
          name: "6. PATCH Update Media",
          request: {
            method: "PATCH",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}/media",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}", "media"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                media: [
                  {
                    role: "COVER",
                    mediaType: "IMAGE",
                    s3Key: "content/tattoos/new-design/cover.webp",
                    sortOrder: 0,
                    isActive: true
                  }
                ]
              }, null, 2)
            }
          }
        },
        {
          name: "7. PATCH Update Taxonomy",
          request: {
            method: "PATCH",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}/taxonomy",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}", "taxonomy"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                contentTypeId: "{{contentTypeId}}",
                tagIds: ["{{tagId1}}", "{{tagId2}}"]
              }, null, 2)
            }
          }
        },
        {
          name: "8. PATCH Update Display",
          request: {
            method: "PATCH",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}/display",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}", "display"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                displays: [
                  {
                    surface: "HOME",
                    displayType: "FEATURED",
                    sortOrder: 1,
                    isActive: true
                  }
                ]
              }, null, 2)
            }
          }
        },
        {
          name: "9. PATCH Update SEO",
          request: {
            method: "PATCH",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}/seo",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}", "seo"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                ogImageKey: "content/tattoos/new-design/cover.webp",
                translations: {
                  en: {
                    metaTitle: "New Design | Maddy Tattoo"
                  }
                }
              }, null, 2)
            }
          }
        },
        {
          name: "10. PATCH Update Status",
          request: {
            method: "PATCH",
            header: [{ key: "Content-Type", value: "application/json" }],
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}/status",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}", "status"]
            },
            body: {
              mode: "raw",
              raw: JSON.stringify({
                status: "PUBLISHED"
              }, null, 2)
            }
          }
        },
        {
          name: "5. DELETE Content",
          request: {
            method: "DELETE",
            url: {
              raw: "{{baseUrl}}/api/v1/contents/{{contentId}}",
              host: ["{{baseUrl}}"],
              path: ["api", "v1", "contents", "{{contentId}}"]
            }
          }
        }
      ]
    }
  ]
};

fs.writeFileSync('postman_main_content.json', JSON.stringify(collection, null, 2));
console.log('Postman collection for Main Content generated successfully!');
