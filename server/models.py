from flask_sqlalchemy import SQLAlchemy
from wtforms import StringField, PasswordField, SelectField
from wtforms.validators import DataRequired, Email, EqualTo


from datetime import datetime,date
db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    gender = db.Column(db.String(50), nullable=False)
    username = db.Column(db.String(150), unique=True, nullable=False)
    phonenumber = db.Column(db.String(20), nullable=False)
    
class GenderDetection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    male_count = db.Column(db.Integer, nullable=False)
    female_count = db.Column(db.Integer, nullable=False)
    
class Cctv(db.Model):
    cctvid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False)
    proxyaddress = db.Column(db.String(150), nullable=True)



# Personnel model to store personnel details
class Personnel(db.Model):
    __tablename__ = 'personnel'
    personnel_id = db.Column(db.Integer, primary_key=True)
    
    # Personal details
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    rank = db.Column(db.String(50), nullable=False)  # E.g., Commandant, Inspector, Sub-Inspector
    phone_number = db.Column(db.String(15), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    address = db.Column(db.String(200))
    password = db.Column(db.String(150), nullable=False)
    # Date of birth for personal record
    date_of_birth = db.Column(db.Date)
    
    # Relations
    battalions = db.relationship('Battalion', backref='commandant', lazy=True)
    added_inventory_items = db.relationship('BattalionInventory', backref='added_by', lazy=True)

    def __repr__(self):
        return f'<Personnel {self.first_name} {self.last_name}, Rank: {self.rank}>'

# Battalion model to store battalion information
class Battalion(db.Model):
    __tablename__ = 'battalion'
    battalion_id = db.Column(db.Integer, primary_key=True)
    battalion_name = db.Column(db.String(100), nullable=False)
    
  
    
    # Commandant reference (personnel who is in charge)
    commandant_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'))

    # Relations
    companies = db.relationship('Company', backref='battalion', lazy=True)
    inventory = db.relationship('BattalionInventory', backref='battalion', lazy=True)

    def __repr__(self):
        return f'<Battalion {self.battalion_name}, Commandant ID: {self.commandant_id}>'

# Company model for sub-units in a battalion
class Company(db.Model):
    __tablename__ = 'company'
    company_id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    
    # Reference to battalion
    battalion_id = db.Column(db.Integer, db.ForeignKey('battalion.battalion_id'))

    # Reference to the head (person in charge)
    head_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'), nullable=True)
    
    # Relations
    platoons = db.relationship('Platoon', backref='company', lazy=True)
    inventory = db.relationship('CompanyInventory', backref='company', lazy=True)
    
    # Backref to get personnel info easily
    head = db.relationship('Personnel', backref='headed_companies')

    def __repr__(self):
        return f'<Company {self.company_name}, Battalion ID: {self.battalion_id}, Head ID: {self.head_id}>'

class Platoon(db.Model):
    __tablename__ = 'platoon'
    platoon_id = db.Column(db.Integer, primary_key=True)
    platoon_name = db.Column(db.String(100), nullable=False)
    
    # Reference to company
    company_id = db.Column(db.Integer, db.ForeignKey('company.company_id'))

    # Reference to the head (person in charge)
    head_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'), nullable=True)

    # Relations
    sections = db.relationship('Section', backref='platoon', lazy=True)
    inventory = db.relationship('PlatoonInventory', backref='platoon', lazy=True)
    
    # Backref to get personnel info easily
    head = db.relationship('Personnel', backref='headed_platoons')

    def __repr__(self):
        return f'<Platoon {self.platoon_name}, Company ID: {self.company_id}, Head ID: {self.head_id}>'

class Section(db.Model):
    __tablename__ = 'section'
    section_id = db.Column(db.Integer, primary_key=True)
    section_name = db.Column(db.String(100), nullable=False)
    
    # Reference to platoon
    platoon_id = db.Column(db.Integer, db.ForeignKey('platoon.platoon_id'))
    checkpost_id = db.Column(db.Integer, db.ForeignKey('checkposts.id'), nullable=True)
    # Reference to the head (person in charge)
    head_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'), nullable=True)

    # Relations
    inventory = db.relationship('SectionInventory', backref='section', lazy=True)
    
    # Backref to get personnel info easily
    head = db.relationship('Personnel', backref='headed_sections')

    def __repr__(self):
        return f'<Section {self.section_name}, Platoon ID: {self.platoon_id}, Head ID: {self.head_id}>'

# Inventory models for different units

# Battalion Inventory model with category and last updated info
class BattalionInventory(db.Model):
    __tablename__ = 'battalion_inventory'
    item_id = db.Column(db.Integer, primary_key=True)
    battalion_id = db.Column(db.Integer, db.ForeignKey('battalion.battalion_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    
    # New column for item category (e.g., Weapons, Medical, Communications)
    category = db.Column(db.String(100), nullable=False)
    
    # Reference to personnel who added this inventory item
    added_by_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'))
    
    # Timestamps
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Item {self.item_name}, Category: {self.category}, Battalion ID: {self.battalion_id}>'

# Company Inventory
class CompanyInventory(db.Model):
    __tablename__ = 'company_inventory'
    item_id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('company.company_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    
    # New column for item category
    category = db.Column(db.String(100), nullable=False)
    
    # Reference to personnel who added this inventory item
    added_by_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'))
    
    # Timestamps
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Item {self.item_name}, Category: {self.category}, Company ID: {self.company_id}>'

# Platoon Inventory
class PlatoonInventory(db.Model):
    __tablename__ = 'platoon_inventory'
    item_id = db.Column(db.Integer, primary_key=True)
    platoon_id = db.Column(db.Integer, db.ForeignKey('platoon.platoon_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    
    # New column for item category
    category = db.Column(db.String(100), nullable=False)
    
    # Reference to personnel who added this inventory item
    added_by_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'))
    
    # Timestamps
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Item {self.item_name}, Category: {self.category}, Platoon ID: {self.platoon_id}>'

# Section Inventory
class SectionInventory(db.Model):
    __tablename__ = 'section_inventory'
    item_id = db.Column(db.Integer, primary_key=True)
    section_id = db.Column(db.Integer, db.ForeignKey('section.section_id'), nullable=False)
    item_name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    
    # New column for item category
    category = db.Column(db.String(100), nullable=False)
    
    # Reference to personnel who added this inventory item
    added_by_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'))
    
    # Timestamps
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Item {self.item_name}, Category: {self.category}, Section ID: {self.section_id}>'

class Headquarter(db.Model):
    __tablename__ = 'headquarters'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    latitude = db.Column(db.Integer)
    longitude = db.Column(db.Integer)
    def __repr__(self):
        return f'<Headquarter {self.name}>'


class Checkpost(db.Model):
    __tablename__ = 'checkposts'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    headquarter_id = db.Column(db.Integer, db.ForeignKey('headquarters.id'), nullable=False)
    latitude = db.Column(db.String(50), nullable=False)
    longitude = db.Column(db.String(50), nullable=False)
    sections = db.relationship('Section', backref='checkpost', lazy=True)


    def __repr__(self):
        return f'<Checkpost {self.latitude}, {self.longitude},{self.name},{self.headquarter_id}>'
    
class SectionsData(db.Model):
    __tablename__ = 'sections_data'
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign key references
    section_id = db.Column(db.Integer, db.ForeignKey('section.section_id'), nullable=False)
    personnel_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'), nullable=False)

    date_assigned = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships to reference the Section and Personnel
    section = db.relationship('Section', backref='sections_data', lazy=True)
    personnel = db.relationship('Personnel', backref='sections_data', lazy=True)

    def __repr__(self):
        return f'<SectionsData Section ID: {self.section_id}, Personnel ID: {self.personnel_id}>'




#Patrol management


class Patrol(db.Model):
    __tablename__ = 'patrols'
    id = db.Column(db.Integer, primary_key=True)
    patrol_name = db.Column(db.String(100), nullable=False)
    checkpost_id = db.Column(db.Integer, db.ForeignKey('checkposts.id'), nullable=False)
    constable_count = db.Column(db.Integer, nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

    # Relationship to patrol checkpoints
    checkpoints = db.relationship('PatrolCheckpoint', backref='patrol', lazy=True)

    def __repr__(self):
        return f'<Patrol {self.patrol_name}, Checkpost ID: {self.checkpost_id}>'


class PatrolCheckpoint(db.Model):
    __tablename__ = 'patrol_checkpoints'
    id = db.Column(db.Integer, primary_key=True)
    patrol_id = db.Column(db.Integer, db.ForeignKey('patrols.id'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    order_in_patrol = db.Column(db.Integer, nullable=False)  # To keep track of checkpoint sequence

    def __repr__(self):
        return f'<PatrolCheckpoint {self.latitude}, {self.longitude} (Order: {self.order_in_patrol})>'



class HeadquarterInventory(db.Model):
    __tablename__ = 'headquarter_inventory'
    item_id = db.Column(db.Integer, primary_key=True)
    item_name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)  # e.g., Food, Medical, Weapons
    quantity = db.Column(db.Integer, nullable=False)
    unit = db.Column(db.String(20), nullable=False)  # Unit as text (e.g., kg, liters, pieces)
      # Flag to indicate if it's a firearm/weapon
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
    image_path = db.Column(db.String(200), nullable=True) 
    def __repr__(self):
        return f'<HeadquarterInventory {self.item_name}, Category: {self.category}, Unit: {self.unit}>'


class CheckpostInventory(db.Model):
    __tablename__ = 'checkpost_inventory'
    id = db.Column(db.Integer, primary_key=True)
    checkpost_id = db.Column(db.Integer, db.ForeignKey('checkposts.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('headquarter_inventory.item_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    headquarter_item = db.relationship('HeadquarterInventory', backref='checkpost_inventories')

    def __repr__(self):
        return f'<CheckpostInventory Item ID: {self.item_id}, Quantity: {self.quantity}, Checkpost ID: {self.checkpost_id}>'


class Order(db.Model):
    __tablename__ = 'orders'
    order_id = db.Column(db.Integer, primary_key=True)
    checkpost_id = db.Column(db.Integer, db.ForeignKey('checkposts.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('headquarter_inventory.item_id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date_ordered = db.Column(db.DateTime, default=datetime.utcnow)
    status=db.Column(db.String(100), nullable=True)
    # Relationships
    checkpost = db.relationship('Checkpost', backref='orders')
    headquarter_item = db.relationship('HeadquarterInventory', backref='orders')

    def __repr__(self):
        return f'<Order Item ID: {self.item_id}, Quantity: {self.quantity}, Checkpost: {self.checkpost_id}>'


class ConsumptionLog(db.Model):
    __tablename__ = 'consumption_logs'
    log_id = db.Column(db.Integer, primary_key=True)
    personnel_id = db.Column(db.Integer, db.ForeignKey('personnel.personnel_id'), nullable=False)
    checkpost_id = db.Column(db.Integer, db.ForeignKey('checkposts.id'), nullable=False)
    item_id = db.Column(db.Integer, db.ForeignKey('headquarter_inventory.item_id'), nullable=False)
    quantity_consumed = db.Column(db.Integer, nullable=False)
    date_consumed = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    personnel = db.relationship('Personnel', backref='consumption_logs')
    checkpost = db.relationship('Checkpost', backref='consumption_logs')
    headquarter_item = db.relationship('HeadquarterInventory', backref='consumption_logs')

    def __repr__(self):
        return f'<ConsumptionLog Item ID: {self.item_id}, Consumed by: {self.personnel_id}, Quantity: {self.quantity_consumed}>'
