from flask_sqlalchemy import SQLAlchemy
import json
from datetime import datetime

db = SQLAlchemy()

class VideoData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    video_id = db.Column(db.String(100), unique=True, nullable=False, index=True)
    video_url = db.Column(db.String(500), nullable=False)
    json_data = db.Column(db.Text, nullable=False)  # Store JSON as text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, video_id, video_url, json_data):
        self.video_id = video_id
        self.video_url = video_url
        # Store JSON as a string
        if isinstance(json_data, dict):
            self.json_data = json.dumps(json_data)
        else:
            self.json_data = json_data

    def get_json(self):
        """Return the JSON data as a Python dictionary"""
        return json.loads(self.json_data)

    def __repr__(self):
        return f'<VideoData {self.video_id}>'
