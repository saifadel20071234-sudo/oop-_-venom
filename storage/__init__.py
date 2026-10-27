"""
Storage Package Initialization
Provides unified access to StorageManager and default storage instance.
"""

from .storage import StorageManager, storage

__all__ = ["StorageManager", "storage"]
