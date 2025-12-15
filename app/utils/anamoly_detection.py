from typing import List, Dict


def detect_anomalies(heart_rate_data: List[Dict]) -> List[Dict]:
    """
    Detect anomalies in heart rate data using statistical methods (z-score).
    
    Args:
        heart_rate_data: List of heart rate readings with 'bpm' key
        
    Returns:
        List of anomalous readings with z-score and severity
    """
    if len(heart_rate_data) < 50:
        return []
    
    # Extract BPM values
    bpm_values = [reading["bpm"] for reading in heart_rate_data]
    
    # Calculate mean and standard deviation
    mean_bpm = sum(bpm_values) / len(bpm_values)
    variance = sum((x - mean_bpm) ** 2 for x in bpm_values) / len(bpm_values)
    std_bpm = variance ** 0.5
    
    anomalies = []
    
    # Detect anomalies using z-score
    for reading in heart_rate_data:
        z_score = (reading["bpm"] - mean_bpm) / std_bpm if std_bpm > 0 else 0
        
        # Flag as anomaly if z-score > 2.5 (roughly 98.8% confidence)
        if abs(z_score) > 2.5:
            anomalies.append({
                **reading,
                "z_score": round(z_score, 2),
                "severity": "high" if abs(z_score) > 3 else "medium"
            })
    
    return anomalies