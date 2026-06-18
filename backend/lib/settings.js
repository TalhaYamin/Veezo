const SiteSettings = require('../models/SiteSettings');

const DEFAULT_QUICK_LINKS = [
  { name: 'Shop', url: '/shop', page: 'shop' },
  { name: 'Collections', url: '/collections', page: 'custom' },
  { name: 'About', url: '/about', page: 'about' },
  { name: 'Contact', url: '/contact', page: 'contact' },
];

const DEFAULT_WHATSAPP = 'https://wa.me/message/B2XYSUMDKY4FL1';

const DEFAULT_SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/veezo_official?igsh=c2Y2ZzN3cXRydGRl',
  facebook: 'https://www.facebook.com/profile.php?id=61588616902831',
  whatsapp: DEFAULT_WHATSAPP,
  twitter: '',
};

const DEFAULT_CONTACT_INFO = {
  phone: '+92 315 4288882',
  email: 'support@veezostore.com',
  address: 'Wah Cantt, Pakistan',
};

const LEGACY_CONTACT_INFO = {
  phone: '+1 (555) 000-0000',
  email: 'concierge@veezo.com',
  address: 'New York, NY',
};

function applyDefaultSocialLinks(settings) {
  settings.footer = settings.footer || {};
  settings.footer.socialLinks = settings.footer.socialLinks || {};

  if (!settings.whatsappNumber) {
    settings.whatsappNumber = DEFAULT_WHATSAPP;
  }

  for (const [key, value] of Object.entries(DEFAULT_SOCIAL_LINKS)) {
    if (!settings.footer.socialLinks[key]) {
      settings.footer.socialLinks[key] = value;
    }
  }

  return settings;
}

function applyDefaultContactInfo(settings) {
  settings.footer = settings.footer || {};
  settings.footer.contactInfo = settings.footer.contactInfo || {};

  for (const [key, value] of Object.entries(DEFAULT_CONTACT_INFO)) {
    const current = settings.footer.contactInfo[key];
    if (!current || current === LEGACY_CONTACT_INFO[key]) {
      settings.footer.contactInfo[key] = value;
    }
  }

  return settings;
}

async function getSiteSettings() {
  let settings = await SiteSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await SiteSettings.create({
      key: 'default',
      whatsappNumber: DEFAULT_WHATSAPP,
      footer: {
        quickLinks: DEFAULT_QUICK_LINKS,
        socialLinks: { ...DEFAULT_SOCIAL_LINKS },
        contactInfo: { ...DEFAULT_CONTACT_INFO },
      },
    });
    return settings;
  }

  let changed = false;
  if (!settings.footer?.quickLinks?.length) {
    settings.footer = settings.footer || {};
    settings.footer.quickLinks = DEFAULT_QUICK_LINKS;
    changed = true;
  }

  const beforeWhatsapp = settings.whatsappNumber;
  const beforeSocial = JSON.stringify(settings.footer?.socialLinks || {});
  const beforeContact = JSON.stringify(settings.footer?.contactInfo || {});
  applyDefaultSocialLinks(settings);
  applyDefaultContactInfo(settings);
  if (
    settings.whatsappNumber !== beforeWhatsapp ||
    JSON.stringify(settings.footer.socialLinks) !== beforeSocial ||
    JSON.stringify(settings.footer.contactInfo) !== beforeContact
  ) {
    changed = true;
  }

  if (changed) {
    await settings.save();
  }

  return settings;
}

function toPublicSettings(settings) {
  return {
    storeName: settings.storeName,
    shippingCost: settings.shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
    whatsappNumber: settings.whatsappNumber || DEFAULT_WHATSAPP,
    footer: {
      ...settings.footer?.toObject?.() || settings.footer,
      contactInfo: {
        ...DEFAULT_CONTACT_INFO,
        ...(settings.footer?.contactInfo?.toObject?.() || settings.footer?.contactInfo || {}),
      },
      socialLinks: {
        ...DEFAULT_SOCIAL_LINKS,
        ...(settings.footer?.socialLinks?.toObject?.() || settings.footer?.socialLinks || {}),
      },
    },
  };
}

module.exports = {
  getSiteSettings,
  toPublicSettings,
  DEFAULT_QUICK_LINKS,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_WHATSAPP,
  DEFAULT_CONTACT_INFO,
};
