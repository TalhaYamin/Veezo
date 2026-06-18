const SiteSettings = require('../models/SiteSettings');

const DEFAULT_QUICK_LINKS = [
  { name: 'Shop', url: '/shop', page: 'shop' },
  { name: 'Collections', url: '/collections', page: 'custom' },
  { name: 'About', url: '/about', page: 'about' },
  { name: 'Contact', url: '/contact', page: 'contact' },
];

async function getSiteSettings() {
  let settings = await SiteSettings.findOne({ key: 'default' });
  if (!settings) {
    settings = await SiteSettings.create({
      key: 'default',
      footer: { quickLinks: DEFAULT_QUICK_LINKS },
    });
  }
  if (!settings.footer?.quickLinks?.length) {
    settings.footer = settings.footer || {};
    settings.footer.quickLinks = DEFAULT_QUICK_LINKS;
    await settings.save();
  }
  return settings;
}

function toPublicSettings(settings) {
  return {
    storeName: settings.storeName,
    shippingCost: settings.shippingCost,
    freeShippingThreshold: settings.freeShippingThreshold,
    whatsappNumber: settings.whatsappNumber,
    footer: settings.footer,
  };
}

module.exports = { getSiteSettings, toPublicSettings, DEFAULT_QUICK_LINKS };
