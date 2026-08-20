import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const contentTypes = [
  {
    slug: 'tattoo',
    coverImageKey: 'content/types/tattoo/cover.webp',
    translations: {
      en: { name: 'Tattoo', description: 'Handcrafted tattoo artwork created by Maddy.', altText: 'Tattoo artwork created by Maddy.' },
      gu: { name: 'ટેટૂ', description: 'મેડી દ્વારા બનાવવામાં આવેલી હસ્તકલા ટેટૂ કલા.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ ટેટૂ આર્ટવર્ક.' },
    },
  },
  {
    slug: 'painting',
    coverImageKey: 'content/types/painting/cover.webp',
    translations: {
      en: { name: 'Painting', description: 'Original paintings and canvas artwork.', altText: 'Painting artwork created by Maddy.' },
      gu: { name: 'પેઇન્ટિંગ', description: 'મૂળ પેઇન્ટિંગ્સ અને કેનવાસ આર્ટવર્ક.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ પેઇન્ટિંગ આર્ટવર્ક.' },
    },
  },
  {
    slug: 'sculpture',
    coverImageKey: 'content/types/sculpture/cover.webp',
    translations: {
      en: { name: 'Sculpture', description: 'Handmade sculptures and 3D artwork.', altText: 'Sculpture created by Maddy.' },
      gu: { name: 'શિલ્પ', description: 'હાથથી બનાવેલા શિલ્પો અને 3D આર્ટવર્ક.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ શિલ્પ.' },
    },
  },
  {
    slug: 'sketch',
    coverImageKey: 'content/types/sketch/cover.webp',
    translations: {
      en: { name: 'Sketch', description: 'Pencil and charcoal sketches.', altText: 'Sketch artwork created by Maddy.' },
      gu: { name: 'સ્કેચ', description: 'પેન્સિલ અને ચારકોલ સ્કેચ.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ સ્કેચ આર્ટવર્ક.' },
    },
  },
  {
    slug: 'photography',
    coverImageKey: 'content/types/photography/cover.webp',
    translations: {
      en: { name: 'Photography', description: 'Professional photography captures.', altText: 'Photography by Maddy.' },
      gu: { name: 'ફોટોગ્રાફી', description: 'વ્યાવસાયિક ફોટોગ્રાફી કૅપ્ચર્સ.', altText: 'મેડી દ્વારા લેવામાં આવેલ ફોટોગ્રાફી.' },
    },
  },
  {
    slug: 'video',
    coverImageKey: 'content/types/video/cover.webp',
    translations: {
      en: { name: 'Video', description: 'Videography and motion art.', altText: 'Video content by Maddy.' },
      gu: { name: 'વિડિઓ', description: 'વિડિઓગ્રાફી અને મોશન આર્ટ.', altText: 'મેડી દ્વારા બનાવવામાં આવેલ વિડિઓ.' },
    },
  },
  {
    slug: 'artwork',
    coverImageKey: 'content/types/artwork/cover.webp',
    translations: {
      en: { name: 'Artwork', description: 'Mixed media and general artwork.', altText: 'General artwork by Maddy.' },
      gu: { name: 'આર્ટવર્ક', description: 'મિશ્રિત માધ્યમ અને સામાન્ય આર્ટવર્ક.', altText: 'મેડી દ્વારા સામાન્ય આર્ટવર્ક.' },
    },
  },
];

async function main() {
  console.log('🌱 Seeding Content Types...');

  for (const ct of contentTypes) {
    // 1. Upsert Content Type
    const contentType = await prisma.contentType.upsert({
      where: { slug: ct.slug },
      update: { cover_image_key: ct.coverImageKey },
      create: {
        slug: ct.slug,
        cover_image_key: ct.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Content Type: ${ct.slug}`);

    // 2. Upsert English Translation
    await prisma.contentTypeTranslation.upsert({
      where: {
        content_type_id_language_code: {
          content_type_id: contentType.id,
          language_code: 'en',
        },
      },
      update: {
        name: ct.translations.en.name,
        description: ct.translations.en.description,
        alt_text: ct.translations.en.altText,
      },
      create: {
        content_type_id: contentType.id,
        language_code: 'en',
        name: ct.translations.en.name,
        description: ct.translations.en.description,
        alt_text: ct.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.contentTypeTranslation.upsert({
      where: {
        content_type_id_language_code: {
          content_type_id: contentType.id,
          language_code: 'gu',
        },
      },
      update: {
        name: ct.translations.gu.name,
        description: ct.translations.gu.description,
        alt_text: ct.translations.gu.altText,
      },
      create: {
        content_type_id: contentType.id,
        language_code: 'gu',
        name: ct.translations.gu.name,
        description: ct.translations.gu.description,
        alt_text: ct.translations.gu.altText,
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
