import React, { useEffect, useState, useRef } from 'react';
import { highlightFirstVideo, pauseImg, playImg, replayImg } from '../utils'
import { hightlightsSlides } from '../constants'
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


const VideoCarousel = () => {

  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);

  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastViideo: false,
    isPlaying: false,
  })

  const [loadData, setLoadData]= useState([]);

  const {isEnd, startPlay, videoId, isLastViideo, isPlaying} = video ;

  useGSAP (() => {

    gsap.to('#slider',{
      transform: `translateX(${-100 * videoId}%)`,
      duration: 2,
      ease: 'power1.inOut',
    })
    gsap.to('#video', {
      scrollTrigger: {
        trigger: '#video',
        toggleActions: 'restart none none none'
      },
      onComplete: () => {
        setVideo((pre) => ({
          ...pre, 
          startPlay: true,
          isPlaying: true,
        }))
      }
    })

  }, [isEnd, videoId])

  useEffect(() => {
    if (loadData.length > 3) {
      videoRef.current.forEach((video, index) => {
        if (index !== videoId) {
          video.pause();
        }
      });
      
      if (!isPlaying) {
        videoRef.current[videoId].pause();
      } else {
        startPlay && videoRef.current[videoId].play();
      }
    }
  }, [startPlay, videoId, isPlaying, loadData]);
  

  const handleLoadMetadata = (i, e) => setLoadData((pre) => [...pre, e]);

  useEffect(() => {
    let currentProgress = 0;
    let span = videoSpanRef.current;

    if (span[videoId]) {
      // animation to move the indicator
      let anim = gsap.to(span[videoId], {
        onUpdate: () => {
          // get the progress of the video
          const progress = Math.ceil(anim.progress() * 100);

          if (progress != currentProgress) {
            currentProgress = progress;

            // set the width of the progress bar
            gsap.to(videoDivRef.current[videoId], {
              width:
                window.innerWidth < 760
                  ? "10vw" // mobile
                  : window.innerWidth < 1200
                  ? "10vw" // tablet
                  : "4vw", // laptop
            });

            // set the background color of the progress bar
            gsap.to(span[videoId], {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },

        // when the video is ended, replace the progress bar with the indicator and change the background color
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: "12px",
            });
            gsap.to(span[videoId], {
              backgroundColor: "#afafaf",
            });
          }
        },
      });

      if (videoId == 0) {
        anim.restart();
      }

      // update the progress bar
      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime /
            hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        // ticker to update the progress bar
        gsap.ticker.add(animUpdate);
      } else {
        // remove the ticker when the video is paused (progress bar is stopped)
        gsap.ticker.remove(animUpdate);
      }
    }
  }, [videoId, startPlay]);

  const handleProcess = (type, i) => {
    switch (type) {
      case 'video-end':
        if (i + 1 < hightlightsSlides.length) {
          setVideo((pre) => ({
            ...pre,
            isEnd: true,
            videoId: i + 1,
            isPlaying: true,
          }));
        } else {
          handleProcess('video-last', i);
        }
        break;
        
      case 'video-last':
        setVideo((pre) => ({ ...pre, isLastViideo: true, isPlaying: false }));
        break;
        
      case 'video-reset':
        setVideo((pre) => ({ ...pre, isLastViideo: false, videoId: 0, isPlaying: true }));
        break;
        
      case 'play':
        setVideo((pre) => ({ ...pre, isPlaying: true }));
        videoRef.current[videoId].play();
        break;
        
      case 'pause':
        setVideo((pre) => ({ ...pre, isPlaying: false }));
        videoRef.current[videoId].pause();
        break;
        
      default:
        return video;
    }
  };
  

  return (
    <>
      <div className='flex items-center'> {hightlightsSlides.map((list, i) => (
        <div key={list.id} id='slider' className='sm:pr-10 pr-20 '>
          <div className='video-carousel_container'>
            <div className='h-full w-full flex-center rounded-3xl overflow-hidden bg-black'>
              <video
                id='video'
                playsInline={true}
                muted
                className={`${
                  list.id === 2 && "translate-x-44"
                } pointer-events-none`}
                ref={(el) => videoRef.current[i] = el}
                onEnded={() => 
                  i !== 3 
                  ? handleProcess('video-end', i)
                  : handleProcess('video-last')
                }
                onPlay={() => {
                  setVideo((prevVideo) => ({
                    ...prevVideo, isPlaying: true
                  }))
                }}
                onLoadedData={(e) => handleLoadMetadata(i, e)}
                preload='auto'>
                <source src={list.video} type='video/mp4'/>
              </video>
            </div>

            <div className='absolute top-12 left-[5%] z-10'>
              {list.textLists.map((text) => (
                <p key={text} className='md:text-2xl text-xl font-medium'>
                  {text}
                </p>
              ))}
            </div>
          </div>
        </div>
      ))} </div>

      <div className="relative flex-center mt-10">
        <div className="py-5 flex-center px-7 bg-gray-300 backdrop-blur rounded-full">
          {videoRef.current.map((_, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className='mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer'
            >
              <span className='absolute h-full w-full rounded-full' 
                ref={(el) => (videoSpanRef.current[i] = el)}/>
            </span>
          ))}
        </div>
        <div>
          <button className='control-btn'>
            <img src={isLastViideo ? replayImg : !isPlaying ? playImg: pauseImg} 
            alt={isLastViideo? 'replay': !isPlaying? 'play' : 'pause'}
            onClick={isLastViideo ? () => 
            handleProcess('video-reset'): 
            !isPlaying ? () => handleProcess('play'): 
            () => handleProcess('pause')}/>
          </button>
        </div>
      </div>

    </>
  )
}

export default VideoCarousel