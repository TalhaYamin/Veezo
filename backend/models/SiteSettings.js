const mongoose = require('mongoose');

const quickLinkSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    url: { type: String, default: '#' },
    page: { type: String, default: 'custom' },
  },
  { _id: true }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'default', unique: true },
    storeName: { type: String, default: 'VEEZO' },
    shippingCost: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 200 },
    whatsappNumber: { type: String, default: 'https://wa.me/message/B2XYSUMDKY4FL1' },
    footer: {
      companyDescription: {
        type: String,
        default: 'Premium fashion for the modern wardrobe. Curated collections, crafted details.',
      },
      contactInfo: {
        phone: { type: String, default: '+92 315 4288882' },
        email: { type: String, default: 'support@veezostore.com' },
        address: { type: String, default: 'Wah Cantt, Pakistan' },
      },
      socialLinks: {
        instagram: {
          type: String,
          default: 'https://www.instagram.com/veezo_official?igsh=c2Y2ZzN3cXRydGRl',
        },
        facebook: {
          type: String,
          default: 'https://www.facebook.com/profile.php?id=61588616902831',
        },
        whatsapp: { type: String, default: 'https://wa.me/message/B2XYSUMDKY4FL1' },
        twitter: { type: String, default: '' },
      },
      copyright: { type: String, default: '© VEEZO. All rights reserved.' },
      quickLinks: { type: [quickLinkSchema], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
