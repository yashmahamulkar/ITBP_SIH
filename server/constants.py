# constants.py

# Personnel Ranks
PERSONNEL_RANKS = [
    "Commandant",          # For Battalion level
    "Deputy Commandant",   # For Company level
    "Assistant Commandant",
    "Inspector",           # For Platoon level
    "Sub-Inspector",
    "Head Constable",      # For Section level
    "Constable"
]

# Inventory Categories
INVENTORY_CATEGORIES = [
    "Weapons",
    "Ammunition",
    "Communication Equipment",
    "Medical Supplies",
    "Clothing",
    "Field Equipment",
    "Food Supplies",
    "Vehicles",
    "Miscellaneous"
]

# Battalion Information
BATTALION_TYPES = [
    "Infantry",
    "Mountain Warfare",
    "Communication",
    "Logistics",
    "Medical Corps"
]

# Default Location Coordinates for Battalions, Companies, Platoons, Sections
DEFAULT_COORDINATES = {
    "latitude": 0.0,
    "longitude": 0.0
}

# Hierarchy Structure
HIERARCHY_LEVELS = {
    "Battalion": "Battalion",
    "Company": "Company",
    "Platoon": "Platoon",
    "Section": "Section"
}

# Role-Based Access Control (RBAC)
ROLE_PERMISSIONS = {
    "Commandant": ["manage_battalion", "view_company_inventory", "add_battalion_inventory", "view_personnel"],
    "Deputy Commandant": ["manage_company", "view_platoon_inventory", "add_company_inventory"],
    "Assistant Commandant": ["manage_platoon", "view_section_inventory", "add_platoon_inventory"],
    "Inspector": ["manage_section", "add_section_inventory"],
    "Sub-Inspector": ["add_section_inventory"],
    "Head Constable": ["add_section_inventory"],
    "Constable": ["view_section_inventory"]
}

# General Permissions
GENERAL_PERMISSIONS = {
    "view_inventory": "View Inventory",
    "add_inventory": "Add Inventory",
    "manage_inventory": "Manage Inventory",
    "manage_personnel": "Manage Personnel",
    "view_personnel": "View Personnel"
}

# Battalion and Unit Sizes
UNIT_SIZES = {
    "Battalion": 1000,     # Typically between 1000-1200 personnel
    "Company": 150,        # Each company has around 100-150 personnel
    "Platoon": 40,         # Each platoon has around 30-40 personnel
    "Section": 15          # Each section has around 10-15 personnel
}

# Item Status
ITEM_STATUS = [
    "Operational",
    "Under Maintenance",
    "Out of Order",
    "Deployed"
]

# Messages or Notifications
MESSAGES = {
    "access_denied": "You do not have permission to access this feature.",
    "item_added_success": "Item added successfully.",
    "item_update_success": "Item updated successfully.",
    "item_delete_success": "Item deleted successfully.",
    "invalid_credentials": "Invalid credentials provided.",
    "personnel_update_success": "Personnel details updated successfully.",
    "personnel_add_success": "Personnel added successfully."
}

# Latitude and Longitude boundaries (used for validation)
LATITUDE_RANGE = (-90.0, 90.0)
LONGITUDE_RANGE = (-180.0, 180.0)

# Example for Default Personnel Data
DEFAULT_PERSONNEL = {
    "personnel_id": 1,
    "first_name": "Shri Rahul",
    "last_name": "Rasgotra",
    "rank": "Director General",
    "phone_number": "+911234567890",
    "email": "john.doe@example.com",
    "address": "ITBP Headquarters, New Delhi, India",
    "date_of_birth": "1980-01-01"
}

