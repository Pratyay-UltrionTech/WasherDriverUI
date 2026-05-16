import type { Job } from './components/JobCard';

export const mockBranchJobs: Job[] = [
  {
    id: 'BR001',
    customerName: 'Sarah Johnson',
    address: '123 Oak Street, Downtown',
    vehicleType: 'Sedan',
    serviceType: 'Full Wash',
    timeSlot: '9:00 AM - 10:00 AM',
    tip: 5,
    status: 'scheduled',
  },
  {
    id: 'BR002',
    customerName: 'Michael Chen',
    address: '456 Pine Avenue, Midtown',
    vehicleType: 'SUV',
    serviceType: 'Premium Detail',
    timeSlot: '10:30 AM - 11:30 AM',
    tip: 10,
    status: 'scheduled',
  },
  {
    id: 'BR003',
    customerName: 'Emily Rodriguez',
    address: '789 Maple Drive, Uptown',
    vehicleType: 'Truck',
    serviceType: 'Express Wash',
    timeSlot: '11:30 AM - 12:30 PM',
    status: 'in_progress',
  },
];

export const mockMobileJobs: Job[] = [
  {
    id: 'MB001',
    customerName: 'Robert Taylor',
    address: '145 Forest Drive, Hillside',
    pinCode: '560001',
    vehicleType: 'Sedan',
    serviceType: 'Full Wash',
    timeSlot: '10:00 AM - 11:00 AM',
    tip: 5,
    status: 'scheduled',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: 'MB002',
    customerName: 'Amanda White',
    address: '678 Valley Road, Riverside',
    pinCode: '560034',
    vehicleType: 'SUV',
    serviceType: 'Express Detail',
    timeSlot: '11:30 AM - 12:30 PM',
    tip: 10,
    status: 'arrived',
    coordinates: { lat: 37.7849, lng: -122.4094 },
  },
];

export const mockAvailableJobs: Job[] = [
  {
    id: 'AV001',
    customerName: 'David Martinez',
    address: '321 Elm Street, West Side',
    pinCode: '560001',
    vehicleType: 'Sedan',
    serviceType: 'Full Wash',
    timeSlot: '11:00 AM - 12:00 PM',
    tip: 3,
    status: 'scheduled',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  {
    id: 'AV002',
    customerName: 'Lisa Anderson',
    address: '654 Birch Road, East District',
    pinCode: '560034',
    vehicleType: 'Hatchback',
    serviceType: 'Interior Clean',
    timeSlot: '1:00 PM - 2:00 PM',
    tip: 5,
    status: 'scheduled',
    coordinates: { lat: 37.7849, lng: -122.4094 },
  },
];

