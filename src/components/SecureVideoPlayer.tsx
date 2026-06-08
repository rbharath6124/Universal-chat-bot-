import { useState } from "react";

interface SecureVideoPlayerProps {
  embedUrl: string;
  lessonId: string;
  lessonDuration: string;
  isLoading: boolean;
  playbackError: string;
  onProgress?: (percent: number) => void;
  onReady?: () => void;
}

export default function SecureVideoPlayer({
  embedUrl,
  isLoading,
  playbackError,
  onReady,
}: SecureVideoPlayerProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const effectiveLoading = isLoading || (!iframeLoaded && !!embedUrl && !playbackError);

  return (
    <div
      className="lms-player-container"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* ── loading overlay ── */}
      {effectiveLoading && !playbackError && (
        <div className="lms-loading-overlay">
          <div className="lms-spinner-ring">
            <div className="lms-spinner-inner" />
          </div>
          <span className="lms-loading-text">Preparing secure stream</span>
        </div>
      )}

      {/* ── error overlay ── */}
      {playbackError && (
        <div className="lms-error-overlay">
          <div className="lms-error-icon">!</div>
          <h2 className="lms-error-title">Playback unavailable</h2>
          <p className="lms-error-msg">{playbackError}</p>
        </div>
      )}

      {/* ── iframe video ── */}
      {embedUrl && !playbackError && (
        <div className="lms-video-frame">
          <iframe
            src={embedUrl}
            title="Secure LMS playback"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            referrerPolicy="strict-origin-when-cross-origin"
            className="lms-iframe"
            onLoad={() => {
              setIframeLoaded(true);
              onReady?.();
            }}
          />
          {/* Overlay to block the Google Drive "Pop-out" button in the top right */}
          <div className="lms-popout-blocker" />
        </div>
      )}
    </div>
  );
}
