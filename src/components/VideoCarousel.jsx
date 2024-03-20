import gsap from 'gsap';
import { hightlightsSlides } from '../constants/index.js';
import { useEffect, useRef, useState } from 'react';
import { pauseImg, playImg, replayImg } from '../utils/index.js';
import { useGSAP } from '@gsap/react';

const VideoCarousel = () => {
    const videoRef = useRef([null]);
    const videoSpanRef = useRef([]);
    const videoDivRef = useRef([]);
    const [video, setVideo] = useState({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false
    });
    const [loadedData, setLoadedData] = useState([]);

    const { isEnd, isLastVideo, startPlay, videoId, isPlaying } = video;

    useGSAP(() => {
        gsap.to('#slider', {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: 'power2.inOut'
        });

        gsap.to('#video', {
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none'
            },
            onComplete: () => {
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    startPlay: true,
                    isPlaying: true
                }));
            }
        });
    }, [isEnd, videoId]);

    useEffect(() => {
        if (loadedData.length > 3) {
            if (!isPlaying) {
                videoRef.current[videoId].pause();
            } else {
                startPlay && videoRef.current[videoId].play();
            }
        }
    }, [startPlay, videoId, isPlaying, loadedData]);

    useEffect(() => {
        let currentProgress = 0;
        const span = videoSpanRef.current;

        if (span[videoId]) {
            const animation = gsap.to(span[videoId], {
                onUpdate: () => {
                    const progress = Math.ceil(animation.progress() * 100);

                    if (progress !== currentProgress) {
                        currentProgress = progress;
                        gsap.to(videoDivRef.current[videoId], {
                            width:
                                window.innerWidth < 768
                                    ? '10vw'
                                    : window.innerWidth < 1200
                                      ? '10vw'
                                      : '4vw'
                        });

                        gsap.to(span[videoId], {
                            width: `${currentProgress}%`,
                            backgroundColor: 'white'
                        });
                    }
                },
                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], {
                            width: '12px'
                        });
                        gsap.to(span[videoId], {
                            backgroundColor: '#afafaf'
                        });
                    }
                }
            });

            if (videoId === 0) {
                animation.restart();
            }

            const animationUpdate = () => {
                animation.progress(
                    videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration
                );
            };

            if (isPlaying) {
                gsap.ticker.add(animationUpdate);
            } else {
                gsap.ticker.remove(animationUpdate);
            }
        }
    }, [videoId, startPlay]);

    const handleProcess = (type, i) => {
        switch (type) {
            case 'video-end':
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    isEnd: true,
                    videoId: i + 1
                }));
                break;
            case 'video-last':
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    isLastVideo: true
                }));
                break;
            case 'video-reset':
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    isLastVideo: false,
                    videoId: 0
                }));
                break;
            case 'play':
            case 'pause':
                setVideo((prevVideo) => ({
                    ...prevVideo,
                    isPlaying: !prevVideo.isPlaying
                }));
                break;
            default:
                return video;
        }
    };

    const handleLoadedMetaData = (i) => setLoadedData((pre) => [...pre, i]);

    return (
        <>
            <div className="flex items-center">
                {hightlightsSlides.map((list, index) => (
                    <div key={list.id} id="slider" className="pr-10 sm:pr-20">
                        <div className="video-carousel_container">
                            <div className="flex-center size-full overflow-hidden rounded-3xl bg-black">
                                <video
                                    id="video"
                                    className={`${list.id === 2 && 'translate-x-44'}
                                           pointer-events-none`}
                                    playsInline={true}
                                    preload="auto"
                                    muted
                                    ref={(el) => (videoRef.current[index] = el)}
                                    onPlay={() => {
                                        setVideo((prevVideo) => ({
                                            ...prevVideo,
                                            isPlaying: true
                                        }));
                                    }}
                                    onLoadedMetadata={(e) => handleLoadedMetaData(index, e)}
                                    onEnded={() => {
                                        index !== 3
                                            ? handleProcess('video-end', index)
                                            : handleProcess('video-last');
                                    }}>
                                    <source src={list.video} type="video/mp4" />
                                </video>
                            </div>
                            <div className="absolute left-[5%] top-12 z-10">
                                {list.textLists.map((text) => (
                                    <p key={text} className="text-xl font-medium md:text-2xl">
                                        {text}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-center relative mt-10">
                <div className="flex-center rounded-full bg-gray-300 px-7 py-5 backdrop-blur">
                    {videoRef.current.map((_, index) => (
                        <span
                            key={index}
                            ref={(el) => (videoDivRef.current[index] = el)}
                            className="relative mx-2 size-3 cursor-pointer rounded-full bg-gray-200">
                            <span
                                className="absolute size-full rounded-full"
                                ref={(el) => (videoSpanRef.current[index] = el)}
                            />
                        </span>
                    ))}
                </div>

                <button className="control-btn">
                    <img
                        src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
                        alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'}
                        onClick={
                            isLastVideo
                                ? () => handleProcess('video-reset')
                                : !isPlaying
                                  ? () => handleProcess('play')
                                  : () => handleProcess('pause')
                        }
                    />
                </button>
            </div>
        </>
    );
};

export default VideoCarousel;
