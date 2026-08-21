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

const categories = [
  {
    slug: 'spiritual',
    coverImageKey: 'content/categories/spiritual/cover.webp',
    translations: {
      en: { name: 'Spiritual', description: 'Spiritual tattoo artwork inspired by faith, mythology and symbolism.', altText: 'Spiritual tattoo artwork category' },
      gu: { name: 'આધ્યાત્મિક', description: 'ધર્મ, પૌરાણિક કથાઓ અને પ્રતીકવાદથી પ્રેરિત આધ્યાત્મિક ટેટૂ આર્ટવર્ક.', altText: 'આધ્યાત્મિક ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'religious',
    coverImageKey: 'content/categories/religious/cover.webp',
    translations: {
      en: { name: 'Religious', description: 'Religious and divine artwork.', altText: 'Religious tattoo artwork category' },
      gu: { name: 'ધાર્મિક', description: 'ધાર્મિક અને દિવ્ય આર્ટવર્ક.', altText: 'ધાર્મિક ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'portrait',
    coverImageKey: 'content/categories/portrait/cover.webp',
    translations: {
      en: { name: 'Portrait', description: 'Realistic portrait artwork and tattoos.', altText: 'Portrait tattoo artwork category' },
      gu: { name: 'પોર્ટ્રેટ', description: 'વાસ્તવિક પોર્ટ્રેટ આર્ટવર્ક અને ટેટૂઝ.', altText: 'પોર્ટ્રેટ ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'nature',
    coverImageKey: 'content/categories/nature/cover.webp',
    translations: {
      en: { name: 'Nature', description: 'Artwork inspired by the natural world.', altText: 'Nature tattoo artwork category' },
      gu: { name: 'કુદરત', description: 'પ્રાકૃતિક વિશ્વથી પ્રેરિત આર્ટવર્ક.', altText: 'કુદરત ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'animals',
    coverImageKey: 'content/categories/animals/cover.webp',
    translations: {
      en: { name: 'Animals', description: 'Animal and wildlife artwork.', altText: 'Animal tattoo artwork category' },
      gu: { name: 'પ્રાણીઓ', description: 'પ્રાણીઓ અને વન્યજીવન આર્ટવર્ક.', altText: 'પ્રાણી ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'minimal',
    coverImageKey: 'content/categories/minimal/cover.webp',
    translations: {
      en: { name: 'Minimal', description: 'Minimalist and simple tattoo artwork.', altText: 'Minimalist tattoo artwork category' },
      gu: { name: 'ન્યૂનતમ', description: 'ન્યૂનતમ અને સરળ ટેટૂ આર્ટવર્ક.', altText: 'ન્યૂનતમ ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'custom',
    coverImageKey: 'content/categories/custom/cover.webp',
    translations: {
      en: { name: 'Custom', description: 'Custom designed tattoo artwork.', altText: 'Custom tattoo artwork category' },
      gu: { name: 'કસ્ટમ', description: 'કસ્ટમ ડિઝાઇન કરેલ ટેટૂ આર્ટવર્ક.', altText: 'કસ્ટમ ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
  {
    slug: 'abstract',
    coverImageKey: 'content/categories/abstract/cover.webp',
    translations: {
      en: { name: 'Abstract', description: 'Abstract and conceptual artwork.', altText: 'Abstract tattoo artwork category' },
      gu: { name: 'અમૂર્ત', description: 'અમૂર્ત અને વૈચારિક આર્ટવર્ક.', altText: 'અમૂર્ત ટેટૂ આર્ટવર્ક કેટેગરી' },
    },
  },
];

const collections = [
  {
    slug: 'mahadev',
    coverImageKey: 'content/collections/mahadev/cover.webp',
    translations: {
      en: { name: 'Mahadev Collection', description: 'A curated collection of Mahadev-inspired tattoo artworks.', altText: 'Mahadev tattoo art collection' },
      gu: { name: 'મહાદેવ કલેક્શન', description: 'મહાદેવથી પ્રેરિત ટેટૂ આર્ટવર્કનો પસંદગીયુક્ત સંગ્રહ.', altText: 'મહાદેવ ટેટૂ આર્ટ કલેક્શન' },
    },
  },
  {
    slug: 'ramayana',
    coverImageKey: 'content/collections/ramayana/cover.webp',
    translations: {
      en: { name: 'Ramayana Collection', description: null, altText: null },
      gu: { name: 'રામાયણ કલેક્શન', description: null, altText: null },
    },
  },
  {
    slug: 'personal-collection',
    coverImageKey: 'content/collections/personal-collection/cover.webp',
    translations: {
      en: { name: 'Personal Collection', description: null, altText: null },
      gu: { name: 'પર્સનલ કલેક્શન', description: null, altText: null },
    },
  },
  {
    slug: 'best-of-maddy',
    coverImageKey: 'content/collections/best-of-maddy/cover.webp',
    translations: {
      en: { name: 'Best of Maddy', description: null, altText: null },
      gu: { name: 'મેડીનું શ્રેષ્ઠ કાર્ય', description: null, altText: null },
    },
  },
  {
    slug: 'spiritual',
    coverImageKey: 'content/collections/spiritual/cover.webp',
    translations: {
      en: { name: 'Spiritual Collection', description: null, altText: null },
      gu: { name: 'આધ્યાત્મિક કલેક્શન', description: null, altText: null },
    },
  },
];

const styles = [
  {
    slug: 'realism',
    coverImageKey: 'content/styles/realism/cover.webp',
    translations: {
      en: { name: 'Realism', description: 'A highly detailed tattoo style focused on realistic textures, depth and lifelike representation.', altText: 'Realism tattoo style artwork' },
      gu: { name: 'રિયાલિઝમ', description: 'વાસ્તવિક ટેક્સચર, ઊંડાણ અને જીવંત રજૂઆત પર આધારિત ટેટૂ શૈલી.', altText: 'રિયાલિઝમ ટેટૂ સ્ટાઇલ આર્ટવર્ક' },
    },
  },
  {
    slug: 'black-and-grey',
    coverImageKey: 'content/styles/black-and-grey/cover.webp',
    translations: {
      en: { name: 'Black & Grey', description: null, altText: null },
      gu: { name: 'બ્લેક એન્ડ ગ્રે', description: null, altText: null },
    },
  },
  {
    slug: 'fine-line',
    coverImageKey: 'content/styles/fine-line/cover.webp',
    translations: {
      en: { name: 'Fine Line', description: null, altText: null },
      gu: { name: 'ફાઇન લાઇન', description: null, altText: null },
    },
  },
  {
    slug: 'minimalist',
    coverImageKey: 'content/styles/minimalist/cover.webp',
    translations: {
      en: { name: 'Minimalist', description: null, altText: null },
      gu: { name: 'મિનિમલિસ્ટ', description: null, altText: null },
    },
  },
  {
    slug: 'neo-traditional',
    coverImageKey: 'content/styles/neo-traditional/cover.webp',
    translations: {
      en: { name: 'Neo Traditional', description: null, altText: null },
      gu: { name: 'નિયો ટ્રેડિશનલ', description: null, altText: null },
    },
  },
  {
    slug: 'traditional',
    coverImageKey: 'content/styles/traditional/cover.webp',
    translations: {
      en: { name: 'Traditional', description: null, altText: null },
      gu: { name: 'ટ્રેડિશનલ', description: null, altText: null },
    },
  },
  {
    slug: 'watercolor',
    coverImageKey: 'content/styles/watercolor/cover.webp',
    translations: {
      en: { name: 'Watercolor', description: null, altText: null },
      gu: { name: 'વોટરકલર', description: null, altText: null },
    },
  },
  {
    slug: 'japanese',
    coverImageKey: 'content/styles/japanese/cover.webp',
    translations: {
      en: { name: 'Japanese', description: null, altText: null },
      gu: { name: 'જાપાનીઝ', description: null, altText: null },
    },
  },
  {
    slug: 'geometric',
    coverImageKey: 'content/styles/geometric/cover.webp',
    translations: {
      en: { name: 'Geometric', description: null, altText: null },
      gu: { name: 'જ્યોમેટ્રિક', description: null, altText: null },
    },
  },
  {
    slug: 'lettering',
    coverImageKey: 'content/styles/lettering/cover.webp',
    translations: {
      en: { name: 'Lettering', description: null, altText: null },
      gu: { name: 'લેટરિંગ', description: null, altText: null },
    },
  },
  {
    slug: 'dotwork',
    coverImageKey: 'content/styles/dotwork/cover.webp',
    translations: {
      en: { name: 'Dotwork', description: null, altText: null },
      gu: { name: 'ડોટવર્ક', description: null, altText: null },
    },
  },
  {
    slug: 'surrealism',
    coverImageKey: 'content/styles/surrealism/cover.webp',
    translations: {
      en: { name: 'Surrealism', description: null, altText: null },
      gu: { name: 'સર્રિયાલિઝમ', description: null, altText: null },
    },
  },
];

const bodyPlacements = [
  {
    slug: 'arm',
    coverImageKey: 'content/body-placements/arm/cover.webp',
    translations: {
      en: { name: 'Arm', description: null, altText: null },
      gu: { name: 'હાથ', description: null, altText: null },
    },
  },
  {
    slug: 'upper-arm',
    coverImageKey: 'content/body-placements/upper-arm/cover.webp',
    translations: {
      en: { name: 'Upper Arm', description: null, altText: null },
      gu: { name: 'ઉપરનો હાથ', description: null, altText: null },
    },
  },
  {
    slug: 'forearm',
    coverImageKey: 'content/body-placements/forearm/cover.webp',
    translations: {
      en: { name: 'Forearm', description: 'A popular tattoo placement located on the lower arm.', altText: 'Forearm tattoo placement' },
      gu: { name: 'ફોરઆર્મ', description: 'નીચેના હાથ પર આવેલું લોકપ્રિય ટેટૂ પ્લેસમેન્ટ.', altText: 'ફોરઆર્મ ટેટૂ પ્લેસમેન્ટ' },
    },
  },
  {
    slug: 'sleeve',
    coverImageKey: 'content/body-placements/sleeve/cover.webp',
    translations: {
      en: { name: 'Sleeve', description: null, altText: null },
      gu: { name: 'સ્લીવ', description: null, altText: null },
    },
  },
  {
    slug: 'wrist',
    coverImageKey: 'content/body-placements/wrist/cover.webp',
    translations: {
      en: { name: 'Wrist', description: null, altText: null },
      gu: { name: 'કાંડો', description: null, altText: null },
    },
  },
  {
    slug: 'hand',
    coverImageKey: 'content/body-placements/hand/cover.webp',
    translations: {
      en: { name: 'Hand', description: null, altText: null },
      gu: { name: 'હાથ', description: null, altText: null },
    },
  },
  {
    slug: 'shoulder',
    coverImageKey: 'content/body-placements/shoulder/cover.webp',
    translations: {
      en: { name: 'Shoulder', description: null, altText: null },
      gu: { name: 'ખભો', description: null, altText: null },
    },
  },
  {
    slug: 'chest',
    coverImageKey: 'content/body-placements/chest/cover.webp',
    translations: {
      en: { name: 'Chest', description: null, altText: null },
      gu: { name: 'છાતી', description: null, altText: null },
    },
  },
  {
    slug: 'back',
    coverImageKey: 'content/body-placements/back/cover.webp',
    translations: {
      en: { name: 'Back', description: null, altText: null },
      gu: { name: 'પીઠ', description: null, altText: null },
    },
  },
  {
    slug: 'spine',
    coverImageKey: 'content/body-placements/spine/cover.webp',
    translations: {
      en: { name: 'Spine', description: null, altText: null },
      gu: { name: 'કરોડરજ્જુ', description: null, altText: null },
    },
  },
  {
    slug: 'neck',
    coverImageKey: 'content/body-placements/neck/cover.webp',
    translations: {
      en: { name: 'Neck', description: null, altText: null },
      gu: { name: 'ગળું', description: null, altText: null },
    },
  },
  {
    slug: 'rib',
    coverImageKey: 'content/body-placements/rib/cover.webp',
    translations: {
      en: { name: 'Rib', description: null, altText: null },
      gu: { name: 'પાંસળી', description: null, altText: null },
    },
  },
  {
    slug: 'thigh',
    coverImageKey: 'content/body-placements/thigh/cover.webp',
    translations: {
      en: { name: 'Thigh', description: null, altText: null },
      gu: { name: 'જાંઘ', description: null, altText: null },
    },
  },
  {
    slug: 'calf',
    coverImageKey: 'content/body-placements/calf/cover.webp',
    translations: {
      en: { name: 'Calf', description: null, altText: null },
      gu: { name: 'પગનો પાછળનો ભાગ', description: null, altText: null },
    },
  },
  {
    slug: 'leg',
    coverImageKey: 'content/body-placements/leg/cover.webp',
    translations: {
      en: { name: 'Leg', description: null, altText: null },
      gu: { name: 'પગ', description: null, altText: null },
    },
  },
  {
    slug: 'ankle',
    coverImageKey: 'content/body-placements/ankle/cover.webp',
    translations: {
      en: { name: 'Ankle', description: null, altText: null },
      gu: { name: 'પગની ઘૂંટી', description: null, altText: null },
    },
  },
  {
    slug: 'foot',
    coverImageKey: 'content/body-placements/foot/cover.webp',
    translations: {
      en: { name: 'Foot', description: null, altText: null },
      gu: { name: 'પગનો પંજો', description: null, altText: null },
    },
  },
];

const tags = [
  { slug: 'shiva', en: 'Shiva', gu: 'શિવ' },
  { slug: 'mahadev', en: 'Mahadev', gu: 'મહાદેવ' },
  { slug: 'om', en: 'Om', gu: 'ૐ' },
  { slug: 'indian', en: 'Indian', gu: 'ભારતીય' },
  { slug: 'spiritual', en: 'Spiritual', gu: 'આધ્યાત્મિક' },
  { slug: 'blackwork', en: 'Blackwork', gu: 'બ્લેકવર્ક' },
  { slug: 'portrait', en: 'Portrait', gu: 'પોર્ટ્રેટ' },
  { slug: 'mandala', en: 'Mandala', gu: 'મંડલા' },
  { slug: 'lion', en: 'Lion', gu: 'સિંહ' },
  { slug: 'tiger', en: 'Tiger', gu: 'વાઘ' },
  { slug: 'minimal', en: 'Minimal', gu: 'મિનિમલ' },
  { slug: 'custom', en: 'Custom', gu: 'કસ્ટમ' },
  { slug: 'handmade', en: 'Handmade', gu: 'હેન્ડમેડ' },
  { slug: 'religious', en: 'Religious', gu: 'ધાર્મિક' },
  { slug: 'traditional', en: 'Traditional', gu: 'પરંપરાગત' },
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

  console.log('🌱 Seeding Categories...');

  for (const cat of categories) {
    // 1. Upsert Category
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { cover_image_key: cat.coverImageKey },
      create: {
        slug: cat.slug,
        cover_image_key: cat.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Category: ${cat.slug}`);

    // 2. Upsert English Translation
    await prisma.categoryTranslation.upsert({
      where: {
        category_id_language_code: {
          category_id: category.id,
          language_code: 'en',
        },
      },
      update: {
        name: cat.translations.en.name,
        description: cat.translations.en.description,
        alt_text: cat.translations.en.altText,
      },
      create: {
        category_id: category.id,
        language_code: 'en',
        name: cat.translations.en.name,
        description: cat.translations.en.description,
        alt_text: cat.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.categoryTranslation.upsert({
      where: {
        category_id_language_code: {
          category_id: category.id,
          language_code: 'gu',
        },
      },
      update: {
        name: cat.translations.gu.name,
        description: cat.translations.gu.description,
        alt_text: cat.translations.gu.altText,
      },
      create: {
        category_id: category.id,
        language_code: 'gu',
        name: cat.translations.gu.name,
        description: cat.translations.gu.description,
        alt_text: cat.translations.gu.altText,
      },
    });
  }

  console.log('🌱 Seeding Collections...');

  for (const col of collections) {
    // 1. Upsert Collection
    const collection = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: { cover_image_key: col.coverImageKey },
      create: {
        slug: col.slug,
        cover_image_key: col.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Collection: ${col.slug}`);

    // 2. Upsert English Translation
    await prisma.collectionTranslation.upsert({
      where: {
        collection_id_language_code: {
          collection_id: collection.id,
          language_code: 'en',
        },
      },
      update: {
        name: col.translations.en.name,
        description: col.translations.en.description,
        alt_text: col.translations.en.altText,
      },
      create: {
        collection_id: collection.id,
        language_code: 'en',
        name: col.translations.en.name,
        description: col.translations.en.description,
        alt_text: col.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.collectionTranslation.upsert({
      where: {
        collection_id_language_code: {
          collection_id: collection.id,
          language_code: 'gu',
        },
      },
      update: {
        name: col.translations.gu.name,
        description: col.translations.gu.description,
        alt_text: col.translations.gu.altText,
      },
      create: {
        collection_id: collection.id,
        language_code: 'gu',
        name: col.translations.gu.name,
        description: col.translations.gu.description,
        alt_text: col.translations.gu.altText,
      },
    });
  }

  console.log('🌱 Seeding Styles...');

  for (const styleData of styles) {
    // 1. Upsert Style
    const style = await prisma.style.upsert({
      where: { slug: styleData.slug },
      update: { cover_image_key: styleData.coverImageKey },
      create: {
        slug: styleData.slug,
        cover_image_key: styleData.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Style: ${styleData.slug}`);

    // 2. Upsert English Translation
    await prisma.styleTranslation.upsert({
      where: {
        style_id_language_code: {
          style_id: style.id,
          language_code: 'en',
        },
      },
      update: {
        name: styleData.translations.en.name,
        description: styleData.translations.en.description,
        alt_text: styleData.translations.en.altText,
      },
      create: {
        style_id: style.id,
        language_code: 'en',
        name: styleData.translations.en.name,
        description: styleData.translations.en.description,
        alt_text: styleData.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.styleTranslation.upsert({
      where: {
        style_id_language_code: {
          style_id: style.id,
          language_code: 'gu',
        },
      },
      update: {
        name: styleData.translations.gu.name,
        description: styleData.translations.gu.description,
        alt_text: styleData.translations.gu.altText,
      },
      create: {
        style_id: style.id,
        language_code: 'gu',
        name: styleData.translations.gu.name,
        description: styleData.translations.gu.description,
        alt_text: styleData.translations.gu.altText,
      },
    });
  }

  console.log('🌱 Seeding Body Placements...');

  for (const bp of bodyPlacements) {
    // 1. Upsert Body Placement
    const bodyPlacement = await prisma.bodyPlacement.upsert({
      where: { slug: bp.slug },
      update: { cover_image_key: bp.coverImageKey },
      create: {
        slug: bp.slug,
        cover_image_key: bp.coverImageKey,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Body Placement: ${bp.slug}`);

    // 2. Upsert English Translation
    await prisma.bodyPlacementTranslation.upsert({
      where: {
        body_placement_id_language_code: {
          body_placement_id: bodyPlacement.id,
          language_code: 'en',
        },
      },
      update: {
        name: bp.translations.en.name,
        description: bp.translations.en.description,
        alt_text: bp.translations.en.altText,
      },
      create: {
        body_placement_id: bodyPlacement.id,
        language_code: 'en',
        name: bp.translations.en.name,
        description: bp.translations.en.description,
        alt_text: bp.translations.en.altText,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.bodyPlacementTranslation.upsert({
      where: {
        body_placement_id_language_code: {
          body_placement_id: bodyPlacement.id,
          language_code: 'gu',
        },
      },
      update: {
        name: bp.translations.gu.name,
        description: bp.translations.gu.description,
        alt_text: bp.translations.gu.altText,
      },
      create: {
        body_placement_id: bodyPlacement.id,
        language_code: 'gu',
        name: bp.translations.gu.name,
        description: bp.translations.gu.description,
        alt_text: bp.translations.gu.altText,
      },
    });
  }

  console.log('🌱 Seeding Tags...');

  for (const tagData of tags) {
    // 1. Upsert Tag
    const tag = await prisma.tag.upsert({
      where: { slug: tagData.slug },
      update: {},
      create: {
        slug: tagData.slug,
        is_active: true,
      },
    });

    console.log(`✅ Upserted Tag: ${tagData.slug}`);

    // 2. Upsert English Translation
    await prisma.tagTranslation.upsert({
      where: {
        tag_id_language_code: {
          tag_id: tag.id,
          language_code: 'en',
        },
      },
      update: {
        name: tagData.en,
      },
      create: {
        tag_id: tag.id,
        language_code: 'en',
        name: tagData.en,
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.tagTranslation.upsert({
      where: {
        tag_id_language_code: {
          tag_id: tag.id,
          language_code: 'gu',
        },
      },
      update: {
        name: tagData.gu,
      },
      create: {
        tag_id: tag.id,
        language_code: 'gu',
        name: tagData.gu,
      },
    });
  }


  console.log('🌱 Seeding Main Content Example...');

  const contentTypeTattoo = await prisma.contentType.findUnique({ where: { slug: 'tattoo' } });
  const categorySpiritual = await prisma.category.findUnique({ where: { slug: 'spiritual' } });
  const collectionMahadev = await prisma.collection.findUnique({ where: { slug: 'mahadev' } });
  const styleRealism = await prisma.style.findUnique({ where: { slug: 'realism' } });
  const bodyPlacementForearm = await prisma.bodyPlacement.findUnique({ where: { slug: 'forearm' } });

  const shivaTag = await prisma.tag.findUnique({ where: { slug: 'shiva' } });
  const mahadevTag = await prisma.tag.findUnique({ where: { slug: 'mahadev' } });
  const omTag = await prisma.tag.findUnique({ where: { slug: 'om' } });

  if (contentTypeTattoo) {
    const mainContentSlug = 'mahadev-realism-tattoo';
    
    // 1. Upsert Content
    const content = await prisma.content.upsert({
      where: { slug: mainContentSlug },
      update: {
        status: 'PUBLISHED',
        published_at: new Date('2026-08-20T00:00:00Z'),
        content_type_id: contentTypeTattoo.id,
        category_id: categorySpiritual?.id,
        collection_id: collectionMahadev?.id,
        style_id: styleRealism?.id,
        body_placement_id: bodyPlacementForearm?.id,
      },
      create: {
        slug: mainContentSlug,
        status: 'PUBLISHED',
        published_at: new Date('2026-08-20T00:00:00Z'),
        content_type_id: contentTypeTattoo.id,
        category_id: categorySpiritual?.id,
        collection_id: collectionMahadev?.id,
        style_id: styleRealism?.id,
        body_placement_id: bodyPlacementForearm?.id,
      },
    });

    console.log(`✅ Upserted Main Content: ${mainContentSlug}`);

    // 2. Upsert English Translation
    await prisma.contentTranslation.upsert({
      where: { content_id_language_code: { content_id: content.id, language_code: 'en' } },
      update: {
        title: 'Mahadev Realism Tattoo',
        short_description: 'A detailed Mahadev realism tattoo inspired by Shiva.',
        description: 'A highly detailed tattoo inspired by the symbolism and presence of Lord Shiva.',
        story: 'This piece was created around the idea of strength and spiritual depth.',
      },
      create: {
        content_id: content.id,
        language_code: 'en',
        title: 'Mahadev Realism Tattoo',
        short_description: 'A detailed Mahadev realism tattoo inspired by Shiva.',
        description: 'A highly detailed tattoo inspired by the symbolism and presence of Lord Shiva.',
        story: 'This piece was created around the idea of strength and spiritual depth.',
      },
    });

    // 3. Upsert Gujarati Translation
    await prisma.contentTranslation.upsert({
      where: { content_id_language_code: { content_id: content.id, language_code: 'gu' } },
      update: {
        title: 'મહાદેવ રિયાલિઝમ ટેટૂ',
        short_description: 'શિવથી પ્રેરિત વિગતવાર મહાદેવ રિયાલિઝમ ટેટૂ.',
      },
      create: {
        content_id: content.id,
        language_code: 'gu',
        title: 'મહાદેવ રિયાલિઝમ ટેટૂ',
        short_description: 'શિવથી પ્રેરિત વિગતવાર મહાદેવ રિયાલિઝમ ટેટૂ.',
      },
    });

    // 4. Upsert Content Media (COVER)
    const coverMediaKey = 'content/tattoos/mahadev-realism/cover.webp';
    await prisma.contentMedia.deleteMany({ where: { content_id: content.id, role: 'COVER' } });
    await prisma.contentMedia.create({
      data: {
        content_id: content.id,
        media_type: 'IMAGE',
        role: 'COVER',
        s3_key: coverMediaKey,
        sort_order: 0,
      }
    });

    // 5. Content Tags
    await prisma.contentTag.deleteMany({ where: { content_id: content.id } });
    const tagsToConnect = [shivaTag, mahadevTag, omTag].filter(Boolean) as { id: string }[];
    for (const t of tagsToConnect) {
      await prisma.contentTag.create({
        data: {
          content_id: content.id,
          tag_id: t.id,
        }
      });
    }

    // 6. Content Display (HOME FEATURED)
    await prisma.contentDisplay.upsert({
      where: {
        content_id_surface_display_type: {
          content_id: content.id,
          surface: 'HOME',
          display_type: 'FEATURED',
        }
      },
      update: { sort_order: 1 },
      create: {
        content_id: content.id,
        surface: 'HOME',
        display_type: 'FEATURED',
        sort_order: 1,
      }
    });

    // 7. Content SEO
    const seo = await prisma.contentSEO.upsert({
      where: { content_id: content.id },
      update: { og_image_key: coverMediaKey },
      create: { content_id: content.id, og_image_key: coverMediaKey },
    });

    // 8. Content SEO Translations
    await prisma.contentSEOTranslation.upsert({
      where: { content_seo_id_language_code: { content_seo_id: seo.id, language_code: 'en' } },
      update: {
        meta_title: 'Mahadev Realism Tattoo | Maddy Tattoo Artist',
        meta_description: 'Explore a detailed Mahadev realism tattoo created by Maddy.',
      },
      create: {
        content_seo_id: seo.id,
        language_code: 'en',
        meta_title: 'Mahadev Realism Tattoo | Maddy Tattoo Artist',
        meta_description: 'Explore a detailed Mahadev realism tattoo created by Maddy.',
      },
    });

    await prisma.contentSEOTranslation.upsert({
      where: { content_seo_id_language_code: { content_seo_id: seo.id, language_code: 'gu' } },
      update: {
        meta_title: 'મહાદેવ રિયાલિઝમ ટેટૂ | મેડી ટેટૂ આર્ટિસ્ટ',
        meta_description: 'મેડી દ્વારા બનાવેલ મહાદેવ રિયાલિઝમ ટેટૂ જુઓ.',
      },
      create: {
        content_seo_id: seo.id,
        language_code: 'gu',
        meta_title: 'મહાદેવ રિયાલિઝમ ટેટૂ | મેડી ટેટૂ આર્ટિસ્ટ',
        meta_description: 'મેડી દ્વારા બનાવેલ મહાદેવ રિયાલિઝમ ટેટૂ જુઓ.',
      }
    });
  }

  console.log('🌱 Seeding Demo Content and Media...');

  const firstContentType = await prisma.contentType.findFirst();

  if (firstContentType) {
    const demoContent = await prisma.content.upsert({
      where: { slug: 'mahadev-realism-demo' },
      update: {},
      create: {
        slug: 'mahadev-realism-demo',
        content_type_id: firstContentType.id,
        status: 'PUBLISHED',
      },
    });

    await prisma.contentMedia.deleteMany({
      where: { content_id: demoContent.id }
    });

    // 1. Cover Image
    await prisma.contentMedia.create({
      data: {
        content_id: demoContent.id,
        media_type: 'IMAGE',
        role: 'COVER',
        s3_key: 'content/tattoos/demo/cover.webp',
        sort_order: 0,
        translations: {
          create: [
            { language_code: 'en', alt_text: 'Mahadev realism tattoo' },
            { language_code: 'gu', alt_text: 'મહાદેવ રિયાલિઝમ ટેટૂ' },
          ],
        },
      },
    });

    // 2. Gallery Image 1
    await prisma.contentMedia.create({
      data: {
        content_id: demoContent.id,
        media_type: 'IMAGE',
        role: 'GALLERY',
        s3_key: 'content/tattoos/demo/gallery-01.webp',
        sort_order: 1,
        translations: {
          create: [
            { language_code: 'en', alt_text: 'Gallery image 1' },
            { language_code: 'gu', alt_text: 'ગેલેરી ઇમેજ 1' },
          ],
        },
      },
    });

    // 3. Gallery Image 2
    await prisma.contentMedia.create({
      data: {
        content_id: demoContent.id,
        media_type: 'IMAGE',
        role: 'GALLERY',
        s3_key: 'content/tattoos/demo/gallery-02.webp',
        sort_order: 2,
        translations: {
          create: [
            { language_code: 'en', alt_text: 'Gallery image 2' },
            { language_code: 'gu', alt_text: 'ગેલેરી ઇમેજ 2' },
          ],
        },
      },
    });

    // 4. Process Image
    await prisma.contentMedia.create({
      data: {
        content_id: demoContent.id,
        media_type: 'IMAGE',
        role: 'PROCESS',
        s3_key: 'content/tattoos/demo/process-01.webp',
        sort_order: 3,
        translations: {
          create: [
            { language_code: 'en', alt_text: 'Process of tattooing' },
            { language_code: 'gu', alt_text: 'ટેટૂ કરવાની પ્રક્રિયા' },
          ],
        },
      },
    });

    // 5. Video
    await prisma.contentMedia.create({
      data: {
        content_id: demoContent.id,
        media_type: 'VIDEO',
        role: 'VIDEO',
        s3_key: 'content/tattoos/demo/video-01.mp4',
        sort_order: 4,
        translations: {
          create: [
            { language_code: 'en', alt_text: 'Tattoo showcase video' },
            { language_code: 'gu', alt_text: 'ટેટૂ પ્રદર્શન વિડિઓ' },
          ],
        },

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
