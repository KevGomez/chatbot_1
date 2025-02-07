import os
import logging
from logging.handlers import RotatingFileHandler
from datetime import datetime

# Create logs directory if it doesn't exist
logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
os.makedirs(logs_dir, exist_ok=True)

def setup_logger(name):
    """Set up logger with both file and console handlers."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)

    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )

    # File handler - separate files for error and info
    info_file = os.path.join(logs_dir, f'info_{datetime.now().strftime("%Y%m%d")}.log')
    error_file = os.path.join(logs_dir, f'error_{datetime.now().strftime("%Y%m%d")}.log')

    # Info file handler
    info_handler = RotatingFileHandler(
        info_file,
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    info_handler.setLevel(logging.INFO)
    info_handler.setFormatter(file_formatter)

    # Error file handler
    error_handler = RotatingFileHandler(
        error_file,
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)

    # Add handlers to logger
    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
    logger.addHandler(console_handler)

    return logger

# Create main application logger
app_logger = setup_logger('chatbot_app') 