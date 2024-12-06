import os

class Config:

    SECRET_KEY = "adaseweasa"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///user_data.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
