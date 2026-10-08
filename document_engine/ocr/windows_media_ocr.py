import asyncio
import io
import logging
from typing import Optional
from .base import OCRProvider

logger = logging.getLogger(__name__)

class WindowsMediaOCRProvider(OCRProvider):
    """
    Native Windows 10/11 OCR engine via WinRT API (winrt-Windows.Media.Ocr).
    Fast, completely offline, zero cloud latency.
    """

    def __init__(self):
        self._engine = None
        self._available = False
        self._init_engine()

    def _init_engine(self):
        try:
            import winrt.windows.media.ocr as ocr
            import winrt.windows.globalization as glob
            lang = glob.Language("en-US")
            if ocr.OcrEngine.is_language_supported(lang):
                self._engine = ocr.OcrEngine.try_create_from_language(lang)
            else:
                self._engine = ocr.OcrEngine.try_create_from_user_profile_languages()
            self._available = self._engine is not None
        except Exception as e:
            logger.warning(f"WindowsMediaOCR initialization failed: {e}")
            self._available = False

    def is_available(self) -> bool:
        return self._available

    def get_provider_name(self) -> str:
        return "windows_media_ocr"

    def extract_text_from_image_bytes(self, image_bytes: bytes) -> str:
        if not self._available or not self._engine:
            raise RuntimeError("Windows Media OCR is not available.")

        try:
            import winrt.windows.graphics.imaging as imaging
            import winrt.windows.storage.streams as streams

            # Create in-memory stream from bytes
            writer = streams.DataWriter()
            writer.write_bytes(image_bytes)
            stream = streams.InMemoryRandomAccessStream()
            
            # Synchronous-compatible async execution
            async def _run_ocr():
                # Store buffer into stream
                buf = writer.detach_buffer()
                await stream.write_async(buf)
                stream.seek(0)
                
                decoder = await imaging.BitmapDecoder.create_async(stream)
                software_bitmap = await decoder.get_software_bitmap_async()
                ocr_result = await self._engine.recognize_async(software_bitmap)
                return ocr_result.text

            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # Running in nested event loop
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
                        return pool.submit(lambda: asyncio.run(_run_ocr())).result(timeout=15)
                else:
                    return loop.run_until_complete(_run_ocr())
            except RuntimeError:
                return asyncio.run(_run_ocr())

        except Exception as e:
            logger.error(f"Error during Windows Media OCR processing: {e}")
            return ""
