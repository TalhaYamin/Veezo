export const DEFAULT_CONTACT_INFO = {
  phone: '+92 315 4288882',
  email: 'support@veezostore.com',
  address: 'Wah Cantt, Pakistan',
};

export function contactInfoFromSettings(settings?: {
  footer?: { contactInfo?: Partial<typeof DEFAULT_CONTACT_INFO> };
}) {
  return {
    phone: settings?.footer?.contactInfo?.phone || DEFAULT_CONTACT_INFO.phone,
    email: settings?.footer?.contactInfo?.email || DEFAULT_CONTACT_INFO.email,
    address: settings?.footer?.contactInfo?.address || DEFAULT_CONTACT_INFO.address,
  };
}
