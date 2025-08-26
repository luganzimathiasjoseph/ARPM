# Asset Management System

## Overview

The Asset Management System is a comprehensive solution for tracking and managing organizational assets throughout their lifecycle. It provides detailed asset information, maintenance tracking, movement history, and financial analysis capabilities.

## Features

### 🏷️ Asset Identification
- **Asset ID/Tag Number**: Unique identifier with auto-generation capability
- **Serial Number**: Manufacturer's serial number tracking
- **Barcode/QR Code**: Support for physical asset identification

### 📋 Comprehensive Asset Information
- **Basic Details**: Name, category, brand, model, description
- **Acquisition**: Purchase date, warranty expiry, cost, supplier, invoice
- **Assignment**: Department, location, assigned user
- **Technical Specifications**: CPU, RAM, storage, OS, capacity, print speed, resolution, power
- **Network Details**: IP address, MAC address, hostname, network location

### 🔧 Lifecycle & Status Tracking
- **Status**: In use, In storage, Under repair, Retired/Disposed
- **Condition**: New, Good, Fair, Poor
- **Maintenance**: Last maintenance date, next maintenance schedule
- **Movement History**: Complete tracking of asset movements and transfers

### 💰 Financial Management
- **Cost Tracking**: Purchase cost and current value
- **Depreciation**: Straight-line and declining balance methods
- **Useful Life**: Configurable asset lifespan in months

### 📱 Accessories & Software
- **Accessories**: Mouse, keyboard, cables, docking station
- **Software Licenses**: Name, license key, expiry date, vendor

## Backend API Endpoints

### Asset Management
- `POST /api/assets` - Create new asset
- `GET /api/assets` - List all assets with filtering
- `GET /api/assets/:id` - Get asset details
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/stats` - Get asset statistics

### Asset Lifecycle
- `PATCH /api/assets/:id/status` - Update asset status and condition
- `PATCH /api/assets/:id/move` - Move asset to new location/department
- `GET /api/assets/:id/depreciation` - Calculate depreciation
- `GET /api/assets/:id/barcode` - Generate barcode/QR data

### Categories & Locations
- `GET /api/assets/categories` - List asset categories
- `GET /api/assets/locations` - List asset locations

## Frontend Components

### CreateAssetForm
A comprehensive form for creating new assets with all required fields organized in logical sections:
- Basic Asset Information
- Acquisition Details
- Assignment & Location
- Technical Specifications
- Network Details
- Accessories & Software
- Lifecycle & Status
- Maintenance
- Financial & Depreciation

### AssetsPage
Enhanced assets listing page with:
- Statistics dashboard
- Advanced filtering and search
- Comprehensive asset table
- Status and condition badges
- Action buttons for view/edit

### AssetDetailPage
Detailed asset view with tabbed interface:
- **Overview**: Basic info, acquisition details, accessories, software
- **Technical Details**: Hardware specs, network information
- **Maintenance**: Schedule and history
- **Movement History**: Complete transfer log
- **Financial**: Cost, depreciation, barcode data

## Database Schema

### Asset Model
```javascript
{
  // Basic Information
  assetId: String (unique, auto-generated),
  serialNumber: String (unique),
  name: String,
  category: ObjectId (ref: Category),
  brand: String,
  model: String,
  description: String,
  
  // Acquisition
  purchaseDate: Date,
  warrantyExpiryDate: Date,
  cost: Number,
  supplier: String,
  invoiceNumber: String,
  
  // Assignment
  department: String,
  location: ObjectId (ref: Location),
  assignedTo: ObjectId (ref: User),
  
  // Technical Specs
  specifications: {
    cpu: String,
    ram: String,
    storage: String,
    operatingSystem: String,
    capacity: String,
    printSpeed: String,
    resolution: String,
    power: String
  },
  
  // Network
  networkDetails: {
    ipAddress: String,
    macAddress: String,
    hostname: String,
    networkLocation: String
  },
  
  // Accessories & Software
  accessories: [String],
  softwareLicenses: [{
    name: String,
    licenseKey: String,
    expiryDate: Date,
    vendor: String
  }],
  
  // Lifecycle
  status: String (enum),
  condition: String (enum),
  lastMaintenanceDate: Date,
  nextMaintenanceSchedule: Date,
  
  // History
  maintenanceHistory: [MaintenanceRecord],
  movementLog: [MovementRecord],
  
  // Financial
  depreciationMethod: String,
  usefulLifeMonths: Number,
  currentValue: Number,
  
  // Metadata
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

## Setup Instructions

### 1. Database Setup
Ensure MongoDB is running and update your `.env` file with:
```
MONGO_URI=mongodb://localhost:27017/arpm
```

### 2. Populate Sample Data
Run the data population script to create sample categories and locations:
```bash
node populate-sample-data.js
```

### 3. Start the Application
```bash
# Terminal 1 - Backend
npm start

# Terminal 2 - Frontend
cd client
npm start
```

## Usage Examples

### Creating an Asset
1. Navigate to Assets → Create Asset
2. Fill in required fields (marked with *)
3. Add technical specifications as needed
4. Configure accessories and software licenses
5. Set maintenance schedule
6. Submit the form

### Managing Asset Lifecycle
1. **Status Updates**: Use the status update endpoint to change asset status
2. **Asset Movement**: Track transfers between departments/locations
3. **Maintenance**: Log maintenance activities and schedule future maintenance
4. **Depreciation**: Automatically calculate current asset value

### Filtering and Search
- Search by Asset ID, Name, or Serial Number
- Filter by Status, Condition, Category, Department, or Location
- View statistics dashboard for quick insights

## Security Features

- **Role-based Access**: Only admins and technicians can create/edit assets
- **Authentication Required**: All endpoints require valid authentication
- **Audit Trail**: Complete tracking of asset changes and movements
- **User Assignment**: Track who is responsible for each asset

## Responsive Design

The system is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

All components automatically adjust their layout and functionality based on screen size.

## Future Enhancements

- **Barcode Scanner Integration**: Mobile app for scanning asset tags
- **Maintenance Alerts**: Email notifications for scheduled maintenance
- **Asset Reports**: Advanced reporting and analytics
- **Integration**: Connect with procurement and accounting systems
- **Mobile App**: Native mobile application for field technicians

## Troubleshooting

### Common Issues

1. **Asset ID Generation**: If auto-generation fails, manually enter a unique ID
2. **Category/Location Missing**: Ensure sample data is populated first
3. **Permission Errors**: Verify user has appropriate role (admin/technician)
4. **Validation Errors**: Check required fields and data formats

### Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

