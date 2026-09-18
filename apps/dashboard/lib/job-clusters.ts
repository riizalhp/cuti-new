export interface JobCluster {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const JOB_CLUSTERS: JobCluster[] = [
  {
    id: 'explore',
    name: 'Semua Terbaru (Explore)',
    description: 'Feed publik terbaru tanpa filter kata kunci',
    keywords: [''],
  },
  {
    id: 'fnb_hospitality',
    name: 'F&B & Resto',
    description: 'Barista, Waiter, Kasir, Cook Helper, Kitchen Crew',
    keywords: ['Barista', 'Waiter', 'Kasir Restoran', 'Cook Helper', 'Crew Restoran'],
  },
  {
    id: 'retail_sales',
    name: 'Retail & Toko',
    description: 'Pramuniaga, SPG/SPB, Store Crew, Penjaga Toko',
    keywords: ['Pramuniaga', 'SPG', 'Store Crew', 'Kasir', 'Penjaga Toko'],
  },
  {
    id: 'office_admin',
    name: 'Admin & Kantor',
    description: 'Admin, Customer Service, Data Entry, Resepsionis',
    keywords: ['Admin', 'Customer Service', 'Data Entry', 'Resepsionis'],
  },
  {
    id: 'logistics_factory',
    name: 'Gudang & Pabrik',
    description: 'Operator Produksi, Gudang, Packing, Helper, Kurir, Driver',
    keywords: ['Operator Produksi', 'Gudang', 'Packing', 'Kurir', 'Driver'],
  },
  {
    id: 'creative_digital',
    name: 'Kreatif & Media',
    description: 'Social Media, Desain Grafis, Content Creator, Editor',
    keywords: ['Social Media', 'Desain Grafis', 'Content Creator', 'Videografer'],
  },
  {
    id: 'tech_services',
    name: 'Teknik & Jasa',
    description: 'Teknisi, Mekanik, IT Support, Cleaning Service, Security',
    keywords: ['Teknisi', 'Mekanik', 'IT Support', 'Cleaning Service', 'Security'],
  },
];
