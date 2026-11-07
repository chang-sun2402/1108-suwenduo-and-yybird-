(()=>{
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
 window.createEndingLetter=function(host,{speed=1,onComplete=()=>{}}={}){
  let cancelled=false,timer=null,complete=false,follow=true,currentSpeed=speed;
  const overlay=document.createElement('section');
  overlay.className='ending-letter';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','suwenduo来电');overlay.tabIndex=-1;
  overlay.innerHTML='<div class="ending-letter-scroll"><article><header>suwenduo来电：</header><div class="ending-letter-copy"></div><span class="ending-letter-period" aria-hidden="true">·</span></article></div>';
  host.append(overlay);
  const scroll=overlay.querySelector('.ending-letter-scroll'),copy=overlay.querySelector('.ending-letter-copy');
  const title=overlay.querySelector('header');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let userScrolling=false;
  const pauseFollow=()=>{userScrolling=true;follow=false;};
  scroll.addEventListener('wheel',event=>{if(event.deltaY<0)pauseFollow();},{passive:true});
  scroll.addEventListener('touchstart',pauseFollow,{passive:true});
  scroll.addEventListener('scroll',()=>{if(userScrolling && scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight<45){follow=true;userScrolling=false;}},{passive:true});
  const delay=ms=>new Promise(resolve=>{timer=setTimeout(resolve,ms/currentSpeed);});
  const reveal=()=>{if(follow)scroll.scrollTop=scroll.scrollHeight;};
  const fill=()=>{title.textContent='suwenduo来电：';copy.replaceChildren(...paragraphs.map((text,index)=>{const p=document.createElement('p');p.textContent=text;if(index===9)p.className='ending-letter-birthday';return p;}));};
  function finish(){if(complete)return;complete=true;overlay.classList.add('is-complete');onComplete();}
  (async()=>{
   await delay(reduced?0:1100);if(cancelled)return;
   overlay.classList.add('is-visible');title.textContent='';
   for(const letter of 'suwenduo来电：'){if(cancelled)return;title.textContent+=letter;await delay(reduced?0:85);}
   await delay(reduced?0:1100);
   for(let index=0;index<paragraphs.length;index++){
    if(cancelled)return;
    const p=document.createElement('p');if(index===9)p.className='ending-letter-birthday';p.classList.add('is-typing');copy.append(p);
    if(reduced){p.textContent=paragraphs[index];}
    else for(const letter of paragraphs[index]){if(cancelled)return;p.append(document.createTextNode(letter));reveal();await delay(/[。！？]/.test(letter)?380:/[，；：]/.test(letter)?160:48);}
    p.classList.remove('is-typing');reveal();await delay(reduced?0:1100);
   }
   if(!cancelled)finish();
  })();
  return {
   element:overlay,
   setSpeed(value){currentSpeed=Math.max(.25,value);},
   showAll(){cancelled=true;clearTimeout(timer);overlay.classList.add('is-visible');fill();scroll.scrollTop=0;finish();},
   destroy(){cancelled=true;clearTimeout(timer);overlay.remove();}
  };
 };
})();
