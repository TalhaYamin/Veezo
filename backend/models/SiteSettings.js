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
    whatsappNumber: { type: String, default: '' },
    footer: {
      companyDescription: {
        type: String,
        default: 'Premium fashion for the modern wardrobe. Curated collections, crafted details.',
      },
      contactInfo: {
        phone: { type: String, default: '+1 (555) 000-0000' },
        email: { type: String, default: 'concierge@veezo.com' },
        address: { type: String, default: 'New York, NY' },
      },
      socialLinks: {
        instagram: { type: String, default: '' },
        facebook: { type: String, default: '' },
        whatsapp: { type: String, default: '' },
        twitter: { type: String, default: '' },
      },
      copyright: { type: String, default: '© VEEZO. All rights reserved.' },
      quickLinks: { type: [quickLinkSchema], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
