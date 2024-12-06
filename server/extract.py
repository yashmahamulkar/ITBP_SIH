# Importing the library
import openlocationcode as olc

# Example Plus Code (replace with your Plus Code)
plus_code = '7FG8VQC7+V8'

# Decoding the Plus Code to latitude and longitude
try:
    lat_lng = olc.decode(plus_code)  # Try decode method
except AttributeError:
    # Fall back in case of older versions or changes
    lat_lng = olc.decode(plus_code)
    

# Access latitude and longitude
latitude = lat_lng.latitudeCenter
longitude = lat_lng.longitudeCenter

# Print the results
print(f"Latitude: {latitude}, Longitude: {longitude}")
