(()=>{
 const endingIntroSource=new URL('ending-intro.mp4',document.currentScript.src).href;
 const paragraphs=[
 '我总觉得，人和人之间的相遇，是一件需要耗费许多运气的事。',
 '在那么漫长的时间里，在无数条本可以永不交汇的人生轨迹中，你们遇见了彼此。或许是许多未曾谋面的岁月，许多阴差阳错的瞬间，才终于换来了这一场相逢。光是想到这里，就已经觉得足够幸运，足够美好。',
 '同时，命运竟然也让我遇见了你们。',
 '于是，两个原本与我的人生毫无交集的人，渐渐成为了我生活里某种温柔而具体的牵挂。我开始为你们的成长欣喜，为你们的挫折难过，为那些旁人看来微不足道的瞬间反复心动。明明隔着那么遥远的距离，情绪却仍然会被你们的一言一行轻易牵动。而我竟也乐在其中，甚至觉得，能够这样远远地看着你们，本身就是一件很幸福的事。',
 '我不知道未来的你们会走向哪里，也不知道许多年后，我们是否还会像今天这样，热切地分享着彼此生命里某段相同的时光。但至少此刻，我真心感谢这场相遇，感谢你们曾经如此鲜活地出现在我的青春里。',
 '而今天，是我们思罕罕小同学的生日。',
 '愿你在往后的日子里，拥有比现在更加广阔的天地，有勇气奔赴想去的远方，也有余裕珍惜身边的风景。愿你被爱，也永远保有爱人的能力；愿你经历成长必经的阵痛，却不必因此失去最初的真诚与热烈。',
 '你不必永远顺遂，不必永远耀眼，也不必成为任何人期待中的模样。',
 '只希望你自由、快乐，坚定地成为自己。',
 '生日快乐，陈思罕。',
 '很高兴你们遇见了彼此，也很高兴，我遇见了你们。'
 ];
 const letters=[
  {title:'suwenduo_来电：',paragraphs,birthdayIndex:9},
  {title:'yybird来电：',paragraphs:[
   '十四岁和十五岁没有什么不同，我的意思是，只要真心放在那里，十五岁和二十五岁也没有区别。',
   '我们用尽全部的力气去爱，又用全部的勇气去忘记，迟迟等不来的那个人，是该从心底划去名字还是一直守护？',
   '我没有答案。',
   '如果你问陈浚铭和陈思罕，他们大概会沉默，然后眯着眼开始回忆，最后在故事里抽丝剥茧，搓搓曾经触碰过的指尖。',
   '写下这个故事，不论真实程度高低，但那些美好却是存在着的。我们抓住这个瞬间，足矣。',
   '生日快乐。'
  ],birthdayIndex:5}
 ];

 const characterWeight=character=>/[。！？]/.test(character)?380:/[，；：]/.test(character)?160:48;
 function buildLetterTimeline(durationMs){
  let variable=1100;
  letters.forEach(letter=>{
   variable+=[...letter.title].length*85+1100;
   variable+=letter.paragraphs.reduce((sum,text)=>sum+[...text].reduce((n,c)=>n+characterWeight(c),0),0)+(letter.paragraphs.length-1)*1100;
  });
  // Keep the ten-second reading pause and the fade at their requested lengths.
  const fixedScale=Math.min(1,durationMs/30000),fixedMs=13600*fixedScale;
  const scale=Math.max(0,(durationMs-fixedMs)/variable);
  const cues=[];let time=1100*scale;
  const add=(type,detail={})=>cues.push({at:time,type,...detail});
  letters.forEach((letter,stage)=>{
   add('begin',{stage,title:letter.title});
   for(const character of letter.title){time+=85*scale;add('title',{character});}
   time+=1100*scale;
   letter.paragraphs.forEach((text,index)=>{
    add('paragraph',{text,birthday:index===letter.birthdayIndex});
    for(const character of text){time+=characterWeight(character)*scale;add('character',{character});}
    add('paragraph-end');
    if(index<letter.paragraphs.length-1)time+=1100*scale;
   });
   if(stage<letters.length-1){
    add('holding');time+=10000*fixedScale;
    add('fading',{duration:3000*fixedScale});time+=3000*fixedScale;
    add('black');time+=600*fixedScale;
   }
  });
  // Anchor the final punctuation to the end of the song, avoiding timer drift.
  cues[cues.length-2].at=durationMs;cues[cues.length-1].at=durationMs;
  cues.push({at:durationMs,type:'complete'});
  return {cues,durationMs,scale};
 }
 window.endingLetterTiming=durationMs=>{
  const plan=buildLetterTimeline(durationMs);
  return {durationMs,typingScale:plan.scale,firstCompleteMs:plan.cues.find(c=>c.type==='holding').at,secondStartsMs:plan.cues.find(c=>c.type==='begin'&&c.stage===1).at};
 };
 window.createEndingLetter=function(host,{speed=1,onComplete=()=>{},onExit=()=>{},videoSrc=endingIntroSource,syncAudio=null,durationMs=null}={}){
  let cancelled=false,timer=null,complete=false,follow=true,currentSpeed=speed,introVideo=null,introLayer=null;
  let frame=null,videoStarted=false,cueIndex=0,currentParagraph=null,fade=null,lastElapsed=-1;
  let virtualElapsed=0,virtualChangedAt=performance.now();
  const songStart=syncAudio?syncAudio.currentTime:0;
  const span=Math.max(1,durationMs??(syncAudio?(syncAudio.duration-songStart)*1000:160104));
  const plan=buildLetterTimeline(span);
  const overlay=document.createElement('section');
  overlay.className='ending-letter';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','suwenduo_与yybird来电');overlay.tabIndex=-1;
  overlay.innerHTML='<div class="ending-letter-scroll"><article><header></header><div class="ending-letter-copy"></div><span class="ending-letter-period" aria-hidden="true">·</span></article></div>';
  host.append(overlay);
  const scroll=overlay.querySelector('.ending-letter-scroll'),copy=overlay.querySelector('.ending-letter-copy'),article=overlay.querySelector('article'),title=overlay.querySelector('header');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userScrolling=false;
  const pauseFollow=()=>{userScrolling=true;follow=false;};
  scroll.addEventListener('wheel',event=>{if(event.deltaY<0)pauseFollow();},{passive:true});
  scroll.addEventListener('touchstart',pauseFollow,{passive:true});
  scroll.addEventListener('scroll',()=>{if(userScrolling && scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight<45){follow=true;userScrolling=false;}},{passive:true});
  const delay=ms=>new Promise(resolve=>{timer=setTimeout(resolve,ms/currentSpeed);});
  const reveal=()=>{if(follow)scroll.scrollTop=scroll.scrollHeight;};
  const paragraphNode=(text,index,letter)=>{const p=document.createElement('p');p.textContent=text;if(index===letter.birthdayIndex)p.className='ending-letter-birthday';return p;};
  const fill=()=>{
   title.textContent=letters[0].title;copy.replaceChildren();
   letters.forEach((letter,index)=>{
    if(index){const header=document.createElement('header');header.className='ending-letter-next-title';header.textContent=letter.title;copy.append(header);}
    copy.append(...letter.paragraphs.map((text,i)=>paragraphNode(text,i,letter)));
   });
  };
  const disposeIntro=()=>{
   if(introVideo){introVideo.pause();introVideo.removeAttribute('src');introVideo.load();introVideo=null;}
   introLayer?.remove();introLayer=null;
  };
  const playIntro=()=>new Promise(resolve=>{
   overlay.dataset.stage='video';
   introLayer=document.createElement('div');introLayer.className='ending-intro';
   introVideo=document.createElement('video');
   const video=introVideo;video.controls=true;video.playsInline=true;video.preload='auto';video.setAttribute('playsinline','');video.setAttribute('aria-label','生日结尾视频');
   const status=document.createElement('p');status.className='ending-intro-status';status.setAttribute('role','status');status.textContent='视频加载中…';
   const play=document.createElement('button');play.type='button';play.className='ending-intro-play';play.textContent='点击播放';play.hidden=true;
   const attempt=()=>{if(cancelled)return;play.hidden=true;status.hidden=false;status.textContent='视频加载中…';video.play().then(()=>{if(!cancelled)status.hidden=true;}).catch(()=>{if(cancelled || !video.getAttribute('src'))return;status.hidden=true;play.hidden=false;play.textContent=video.error?'视频暂时无法播放，点击重试':'点击播放';});};
   play.onclick=()=>{if(video.error)video.load();attempt();};
   video.addEventListener('playing',()=>{status.hidden=true;play.hidden=true;});
   video.addEventListener('pause',()=>{if(!cancelled && !video.ended && video.getAttribute('src')){play.textContent='继续播放';play.hidden=false;}});
   video.addEventListener('error',()=>{if(cancelled || !video.getAttribute('src'))return;status.hidden=true;play.textContent='视频暂时无法播放，点击重试';play.hidden=false;});
   video.addEventListener('ended',resolve,{once:true});
   introLayer.append(video,status,play);overlay.append(introLayer);video.src=videoSrc;attempt();
  });

  function finish(){if(complete)return;complete=true;overlay.dataset.stage='complete';overlay.classList.add('is-complete');onComplete();}
  function detachAudio(){if(syncAudio)for(const event of ['timeupdate','seeked','ended'])syncAudio.removeEventListener(event,render);}
  async function playClosingVideo(){
   if(cancelled||videoStarted)return;
   videoStarted=true;cancelAnimationFrame(frame);detachAudio();
   overlay.dataset.stage='video-black';article.style.transition=reduced?'none':'opacity .6s ease';article.style.opacity='0';
   await delay(reduced?0:600);if(cancelled)return;
   if(videoSrc){await playIntro();if(cancelled)return;disposeIntro();}
   await delay(reduced?0:500);if(cancelled)return;
   overlay.remove();onExit();
  }
  function applyCue(cue){
   switch(cue.type){
    case 'begin':
     overlay.dataset.stage=String(cue.stage);overlay.classList.add('is-visible');overlay.classList.remove('is-complete');
     article.style.transition='';article.style.opacity='';title.textContent=reduced?cue.title:'';copy.replaceChildren();scroll.scrollTop=0;follow=true;userScrolling=false;fade=null;break;
    case 'title':if(!reduced)title.append(document.createTextNode(cue.character));break;
    case 'paragraph':currentParagraph=document.createElement('p');if(cue.birthday)currentParagraph.classList.add('ending-letter-birthday');if(reduced)currentParagraph.textContent=cue.text;else currentParagraph.classList.add('is-typing');copy.append(currentParagraph);reveal();break;
    case 'character':if(!reduced)currentParagraph.append(document.createTextNode(cue.character));reveal();break;
    case 'paragraph-end':currentParagraph.classList.remove('is-typing');break;
    case 'holding':overlay.dataset.stage='holding';break;
    case 'fading':overlay.dataset.stage='fading';article.style.transition='none';fade=cue;break;
    case 'black':overlay.dataset.stage='between-letters';article.style.opacity='0';fade=null;break;
    case 'complete':finish();break;
   }
  }
  function elapsed(){return syncAudio?Math.min(span,Math.max(0,(syncAudio.currentTime-songStart)*1000)):Math.min(span,virtualElapsed+(performance.now()-virtualChangedAt)*currentSpeed);}
  function render(){
   if(cancelled||videoStarted)return;
   cancelAnimationFrame(frame);
   const time=syncAudio?.ended?span:elapsed();
   if(time<lastElapsed-.5){cueIndex=0;complete=false;fade=null;overlay.classList.remove('is-visible','is-complete');article.style.opacity='';title.textContent='';copy.replaceChildren();}
   while(cueIndex<plan.cues.length&&plan.cues[cueIndex].at<=time+.01)applyCue(plan.cues[cueIndex++]);
   if(fade)article.style.opacity=String(reduced?0:Math.max(0,1-(time-fade.at)/fade.duration));
   lastElapsed=time;
   if(time>=span&&(!syncAudio||syncAudio.ended)){playClosingVideo();return;}
   frame=requestAnimationFrame(render);
  }
  if(syncAudio)for(const event of ['timeupdate','seeked','ended'])syncAudio.addEventListener(event,render);
  render();
  return {
   element:overlay,
   setSpeed(value){virtualElapsed=elapsed();virtualChangedAt=performance.now();currentSpeed=Math.max(.25,value);},
   showAll(){cancelled=true;clearTimeout(timer);cancelAnimationFrame(frame);detachAudio();disposeIntro();article.style.opacity='';overlay.classList.add('is-visible');fill();scroll.scrollTop=0;finish();},
   destroy(){cancelled=true;clearTimeout(timer);cancelAnimationFrame(frame);detachAudio();disposeIntro();overlay.remove();}
  };
 };
})();
