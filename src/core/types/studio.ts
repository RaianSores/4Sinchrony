export interface Studio {
  id: string;
  name: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  active?: boolean;
  capacity?: number;
  openingTime?: string;
  closingTime?: string;
}

export interface Bike {
  id?: string;
  studioId?: string;
  number: number;
  status: 'available' | 'occupied' | 'broken' | 'maintenance';
  notes?: string;
}
