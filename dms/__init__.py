"""Driver Monitoring System (DMS) Package.

Edge-Cloud real-time inattention, drowsiness, and distraction detection with
adaptive alerting and false alarm reduction.
"""

from dms.camera import CameraFeed
from dms.blindness import CameraBlindCheck
from dms.roi import DriverRoiTracker
from dms.detector import DriverBehaviorDetector
from dms.eye_tracker import EyeTracker
from dms.temporal_filter import TemporalFilter
from dms.suppression import SuppressionEngine
from dms.alerts import AlertManager
from dms.calibration import DriverCalibrationSession
from dms.readiness import DriverReadinessCheck
from dms.rest_stops import RestStopRecommender
from dms.database import DmsDatabaseLogger
from dms.engine import DmsEngine
from dms.server import DmsServer

__version__ = "1.0.0"
