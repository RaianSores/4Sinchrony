import { ClassPackage } from '../../../shared/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const packages: ClassPackage[] = [
  {
    id: 'pkg_1',
    name: '1 Aula',
    credits: 1,
    price: 45,
    pricePerCredit: 45,
    validityDays: 30,
  },
  {
    id: 'pkg_2',
    name: '5 Aulas',
    credits: 5,
    price: 190,
    pricePerCredit: 38,
    validityDays: 60,
  },
  {
    id: 'pkg_3',
    name: '10 Aulas',
    credits: 10,
    price: 340,
    pricePerCredit: 34,
    validityDays: 90,
    popular: true,
  },
  {
    id: 'pkg_4',
    name: '20 Aulas',
    credits: 20,
    price: 600,
    pricePerCredit: 30,
    validityDays: 180,
  },
  {
    id: 'pkg_5',
    name: 'Mensal Ilimitado',
    credits: 30,
    price: 249,
    pricePerCredit: 8.3,
    validityDays: 30,
  },
];

export const packageService = {
  async getPackages(): Promise<ClassPackage[]> {
    await delay(400);
    return [...packages];
  },
};
