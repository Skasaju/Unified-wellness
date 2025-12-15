import random
import math


class HeartRateSimulator:
    """
    Simulates realistic heart rate data with various activity levels.
    """
    
    def __init__(self, activity_level: str = "resting",anamoly:bool=True):
        """
        Initialize heart rate simulator.
        
        Args:
            activity_level: Current activity level
        """
        self.activity_level = activity_level
        self.time_elapsed = 0
        self.base_hr = self._calculate_base_hr()
        self.anamoly = anamoly
    
    def _calculate_base_hr(self) -> int:
        """Calculate base heart rate based on activity level."""
        base_rates = {
            "resting": random.randint(60, 75),
            "walking": random.randint(90, 110),
            "jogging": random.randint(130, 150),
            "running": random.randint(150, 170),
            "cooldown": random.randint(100, 120)
        }
        return base_rates.get(self.activity_level, 70)
    
    def get_next_value(self) -> int:
        """
        Generate next heart rate value with realistic variations.
        
        Returns:
            Heart rate in BPM
        """
        self.time_elapsed += 1
        
        # Add sine wave variation for natural rhythm
        sine_variation = 3 * math.sin(self.time_elapsed / 10)
        
        # Add random noise
        random_noise = random.uniform(-2, 2)
        
        hr = int(self.base_hr + sine_variation + random_noise)
        
        if self.anamoly and random.random() < 0.20:
            anomaly_type = random.choice(["tachycardia", "bradycardia"])

            if anomaly_type == "tachycardia":
                hr += random.randint(40, 70)
            else:
                hr -= random.randint(30, 50)
        
        # Ensure heart rate stays within realistic bounds
        return max(40, min(200, hr))
    
    def transition_activity(self, new_activity: str):
        """
        Gradually transition to a new activity level.
        
        Args:
            new_activity: New activity level
        """
        self.activity_level = new_activity
        new_base = self._calculate_base_hr()
        
        # Smooth transition by averaging with current rate
        self.base_hr = int((self.base_hr + new_base) / 2)