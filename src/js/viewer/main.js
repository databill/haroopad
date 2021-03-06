var _doc,
  _body,
  _md_body;
var _options = {
  dirname: '.'
};
var codeLanguages;
var codeLangTable = {
  "js": "javascript",
  "html": "xml"
};
var viewStyle, codeStyle;
var contentElements;

window.ee = new EventEmitter();

window.ondragover = function(e) {
  e.preventDefault();
  return false;
};
window.ondrop = function(e) {
  var i = 0,
    file, fArr, ext;

  for (i; i < e.dataTransfer.files.length; ++i) {

    ee.emit('drop', e.dataTransfer.files[i]);
    // file = e.dataTransfer.files[i].path;
    // fArr = file.split('.');
    // ext = fArr[fArr.length-1];

    // if (ext.toLowerCase() === 'css') {
    //   loadCustom(file);
    //   $(document.body).addClass('custom');
    // }
  }
  e.preventDefault();
};

function loadJs(url, cb) {
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.onload = cb;

  head.appendChild(script);
}

function loadCss(url) {
  $('<link>').attr({
    type: 'text/css',
    rel: 'stylesheet',
    href: url
  }).appendTo('head');
}

function setStyle(property, value) {
  document.querySelector('#root').style[property] = value;
}

function setFontSize(size) {
  setStyle('fontSize', size + 'px');
}

function setFontFamily(name) {
  // setStyle('fontFamily', name);
}

function setViewStyle(style) {
  var href = 'css/markdown/' + style + '/' + style + '.css';

  document.querySelector('#view').setAttribute('href', href);

  _body.setAttribute('class', 'markdown '+ style);
}

function setCodeStyle(style) {
  // var href = 'css/code/' + style + '.css';
  // $('#code').attr({
  //   href: href
  // });
  document.querySelector('#code').setAttribute('href', style);
}

/**
 * set column layout
 * @param {[type]} count [description]
 */

function setColumn(count) {
  var href,
    count = count || 'single';

  href = 'css/column/' + count + '.css';
  $('#column').attr({
    href: href
  });
}

/**
 * set toc style
 */

function showOutline() {
  var href;

  href = 'css/viewer-toc/default.css';
  $('#toc').attr({
    href: href + '?' + new Date().getTime()
  });
}

function showTOC() {
  var href;

  href = 'css/viewer-toc/only-toc.css';
  $('#toc').attr({
    href: href + '?' + new Date().getTime()
  });
}

function hideOutline() {
  $('#toc').removeAttr('href');
}

function hideTOC() {
  $('#toc').removeAttr('href');
}

function showOnlyTOC() {
  // var elArr = document.body.querySelectorAll(':scope>*');
  // elArr = Array.prototype.slice.call(elArr, 0);

  // contentElements = elArr.filter(function(el) {
  //   return !/^H[1-6]/.test(el.tagName);
  // });

  // contentElements.forEach(function(el) {
  //   el.style.display = 'none';
  // });
}

function showAllContent() {
  contentElements.forEach(function(el) {
    el.style.display = '';
  });
}

function createTOC() {
  var toc = generateTOC(_body);
  $(_body).prepend('<div id="toc"></div>');
  $('#toc').html(toc);
  $(_body).scrollspy('refresh');
}

function init(options) {
  _options = options;
}

function loadLibs(base, cb) {
  window.chrome.loadTimes = true;
  loadJs(base + '/MathJax/MathJax.js?config=TeX-AMS_HTML-full', function() {
    MathJax.Hub.Config({
      // extensions: ["tex2jax.js"],
      // jax: ["input/TeX","output/HTML-CSS"],
      messageStyle: "none",
      showProcessingMessages: false,
      "HTML-CSS": {
        linebreaks: {
          automatic: true
        }
      },
      TeX: {
        // Macros: {
        //   RR: '{\\bf R}',                // a simple string replacement
        //   bold: ['\\boldsymbol{#1}',1]   // this macro has one parameter
        // }
        // equationNumbers: { autoNumber: "all" }
      },
      tex2jax: {
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)'],
          ['$$$', '$$$']
        ],
        // displayMath: [
        //   ['$$', '$$'],
        //   ['\\[', '\\]']
        // ],
        processEscapes: true
      }
    });
    MathJax.Hub.config.menuSettings.renderer = 'HTML-CSS'; //'SVG', 'NativeMML'

    cb();
  });
}
/**
 * for fix image path
 * @return {[type]} [description]
 */

function _fixImagePath() {
  $('img').on('error', function() {
    $(this).attr('src', './img/noimage.gif');
    $(this).attr('title', 'It is not possible to display image does not exist in that location.');
  });
}

function htmlDecode(input) {
  var e = document.createElement('div');
  e.innerHTML = input;
  return e.textContent;
}

/**
 * replace data-echo
 */
function replaceLazyLoading() {
  var frags, data;
  frags = _md_body.querySelectorAll('[data-echo]');
  frags = Array.prototype.slice.call(frags, 0);

  frags.forEach(function(frag) {
    data = frag.getAttribute('data-echo');
    frag.setAttribute('src', data);
    frag.removeAttribute('data-echo');
  });
}

//for performance
function _lazySyntaxHighlight(el) {
  // var codeEl = el.firstElementChild;
  var code = el.innerHTML;
  var lang = el.className;
  var pre = el.parentElement;

  if (!lang) {
    return;
  }

  lang = lang.toLowerCase();

  if (codeLangTable.hasOwnProperty(lang)) {
    lang = codeLangTable[lang];
  }

  // lang = lang == 'js' ? 'javascript' : lang;

  if (codeLanguages.indexOf(lang) == -1) {
    el.setAttribute('class', lang);
    return code;
  }

  pre.setAttribute('class', lang + ' hljs');

  code = htmlDecode(code);

  try {
    if (!lang) {
      // el.innerHTML = hljs.highlightAuto(code).value;
      pre.innerHTML = hljs.highlightAuto(code).value;
    } else {
      // el.innerHTML = hljs.highlight(lang, code).value;
      pre.innerHTML = hljs.highlight(lang, code).value;
    }
  } catch (e) {
    // return code;
  }
}


/**
 * dynamic update TOC
 * @param  {[type]} toc [description]
 * @return {[type]}     [description]
 */
function updateTOC(toc) {
  var tocEls = _md_body.querySelectorAll('.toc');
  tocEls = Array.prototype.slice.call(tocEls, 0);

  tocEls.forEach(function(tocEl) {
    tocEl.innerHTML = toc;
  });
}

function countFragments(target) {
  var headers = target.querySelectorAll('h1, h2, h3, h4, h5, h6');
  var imgs = target.querySelectorAll('img');
  // var bold = target.querySelectorAll('strong').length;
  // var italic = target.querySelectorAll('i').length;
  var codes = target.querySelectorAll('code');
  // var fencedcode = code - target.querySelectorAll('pre>code').length;
  var blockquotes = target.querySelectorAll('blockquote');
  var paragraphs = target.querySelectorAll('p');
  var links = target.querySelectorAll('a');
  var tables = target.querySelectorAll('table');

  window.ee.emit('dom', {
    header: headers.length,
    paragraph: paragraphs.length,
    link: links.length,
    image: imgs.length,
    code: codes.length,
    // fencedcode: fencedcode,
    blockquote: blockquotes.length,
    table: tables.length
  });

  window.ee.emit('title', headers[0] && headers[0].innerHTML);
}

function processMathJax(target, cb) {
  var _mathEl = document.createElement('div');
  // _mathEl.innerHTML = '';
  _mathEl.innerHTML = target.innerHTML;

  MathJax.Hub.Queue(
    ["Typeset", MathJax.Hub, _mathEl],
    [function() {
      // console.log(_mathEl)
      target.innerHTML = _mathEl.innerHTML;
      target.removeAttribute('class');
    },this]
  );
  // MathJax.Hub.Queue(
  //   ["Typeset", MathJax.Hub, _mathEl]
  //   [function() {
  //     console.log('aljdsf')
  //     console.log(_mathEl.innerHTML)
  //     target.innerHTML = mathEl.innerHTML;
  //     target.removeAttribute('class');
  //   }, this],
  //   [cb]
  // );
}

function drawMathJax() {
  var i, math = _md_body.querySelectorAll('.mathjax');
  math = Array.prototype.slice.call(math, 0);

  for (i = 0; i < math.length; i++) {
    processMathJax(math[i]);
  }
}

var _embedTimeout;
var ebdOpt = {
  includeHandle: false,
  embedMethod: 'fill',
  afterEmbed: function(oembedData, externalUrl) {
    var hasImage = this[0].querySelector('img');

    if (typeof oembedData.code == 'string') {
      this.attr('data-replace', oembedData.code);
    }

    if (hasImage) {
      Echo.push(hasImage);
    }
  },
  onProviderNotFound: function(url) {
    this.html('<a href="http://pad.haroopress.com/page.html?f=open-media">이 주소는 콘텐츠 스마트 임베딩을 지원하지 않습니다.</a>');
  }
};
var spinner = document.createElement('span');

function drawEmbedContents(target) {
  var url, embed, embeds = target.querySelectorAll('.oembed');
  embeds = Array.prototype.slice.call(embeds, 0);

  for (i = 0; i < embeds.length; i++) {
    embed = embeds[i];

    spinner = embed.appendChild(spinner);
    spinner.setAttribute('class', 'spinner');
  }

  if (_embedTimeout) {
    window.clearTimeout(_embedTimeout);
  }

  _embedTimeout = window.setTimeout(function() {
    for (i = 0; i < embeds.length; i++) {
      ebdOpt.ebdOpt = {};
      embed = embeds[i];

      url = embed.firstElementChild.getAttribute('href');

      $(embed).oembed(url, ebdOpt);

      embed.removeAttribute('class');
      embed.setAttribute('class', 'oembeded');
    }
  }, 1000);
}

function empty() {
  _md_body.innerHTML = '';
}

function indexingTasklist() {
  var tasks = _md_body.querySelectorAll('input.task-list-item');
  tasks = Array.prototype.slice.call(tasks, 0);

  for (i = 0; i < tasks.length; i++) {
    task = tasks[i];
    task.setAttribute('data-task-index', i);
  }
}

function cleanXSS(element) {
  var meta = element.querySelectorAll('meta[http-equiv]');
  meta = Array.prototype.slice.call(meta, 0);

  meta.forEach(function(el) {
    el.remove();
  });

  var script = element.querySelectorAll('script');
  script = Array.prototype.slice.call(script, 0);

  script.forEach(function(el) {
    el.remove();
  });

  return element;
}

/**
 * update contents
 * @param  {[type]} contents [description]
 * @return {[type]}          [description]
 */
// var wrapper = document.createElement('div');
//@TODO initial render
function update(wrapper) {
  var i, j, limit, frag, frags, _frag, _frags, origin, _origin,
    code, codes, _code, _codes;
  // var changeTOC = false;

  // wrapper.innerHTML = html;
  wrapper = cleanXSS(wrapper);

  frags = wrapper.querySelectorAll(':scope>*');
  frags = Array.prototype.slice.call(frags, 0);

  _frags = _md_body.querySelectorAll(':scope>*');
  _frags = Array.prototype.slice.call(_frags, 0);

  //새로 생성된 pre 엘리먼트 origin attribute 에 본래 html 을 저장
  codes = wrapper.querySelectorAll('pre>code');
  codes = Array.prototype.slice.call(codes, 0);

  _codes = _md_body.querySelectorAll('pre>code');
  _codes = Array.prototype.slice.call(_codes, 0);

  for (i = 0; i < codes.length; i++) {
    code = codes[i];
    _code = _codes[i];

    // origin = code.parentElement.outerHTML;
    origin = code.innerHTML;
    // code.setAttribute('data-origin', origin);
    code.parentElement.setAttribute('data-origin', origin);

    if (_code) {
      _origin = _code.parentElement.getAttribute('data-origin');

      if (origin != _origin) {
        _lazySyntaxHighlight(code);
      }
    } else {
      _lazySyntaxHighlight(code);
    }
  }

  var src, img, imgs = wrapper.querySelectorAll('img');
  for (i = 0; i < imgs.length; i++) {
    img = imgs[i];
    src = img.getAttribute('src');

    if (!src) {
      continue;
    }

    if (src.indexOf('://') == -1 && !/^\//.test(src) && !/^[a-zA-Z]\:/.test(src) && src.indexOf('data:') == -1) {
      img.setAttribute('src', _options.dirname + '/' + src);
    } else {
      img.setAttribute('src', 'app://root/img/blank.gif');
      img.setAttribute('data-echo', src);
    }
  }

  // 작성된 내용이 있는 경우 새로운 프레그먼트로 치환
  // for (i = 0; i < frags.length; i++) {
  i = 0;
  limit = frags.length;
  while (i < limit) {
    frag = frags[i].cloneNode(true);
    _frag = _frags.shift();

    origin = frag.outerHTML;
    frag.setAttribute('data-origin', origin);

    //이전 프레그먼트 없는 경우 body 에 추가
    if (!_frag) {
      _md_body.appendChild(frag);

      //check change toc
      // if (/^H[1-6]/.test(frag.tagName) == true) {
      //   changeTOC = true;
      // }
    } else {

      //이전 렌더링에 origin 문자열이 있는 경우 origin 문자열로 대조한다.
      _origin = _frag.getAttribute('data-origin');

      //origin 문자열이 있는 경우
      if (origin != _origin) {
        _frag.style.display = 'none';
        _md_body.insertBefore(frag, _frag);
        _md_body.removeChild(_frag);

        // if (/^H[1-6]/.test(frag.tagName) == true) {
        //   changeTOC = true;
        // }
      }
    }
    i++;
  }

  //새로이 작성된 내용이 지난 작성 내용에 비해 적을 경우
  //남아 있는 프레그먼트를 모두 제거
  if (_frags.length > 0) {
    _frags.forEach(function(frag, idx) {
      _md_body.removeChild(frag);
    });
  }

  //fire event when changed TOC
  // if (changeTOC) {
  //   window.ee.emit('change.toc', undefined, _md_body);
  // }

  // countFragments(_md_body);
  drawMathJax();
  drawEmbedContents(document.body);

  Echo.init({
    offset: 10,
    throttle: 250
  });

  try {
    mermaid.init();
  } catch (e) {}

  indexingTasklist();

  window.ee.emit('rendered', _md_body);
}
/**
 * sync scroll position
 * @param  {[type]} per [description]
 * @return {[type]}     [description]
 */

function scrollTop(per) {
  var h = $(window).height();
  var top = $(_body).prop('clientHeight') - h;

  $(window).scrollTop(top / 100 * per);
}


$(document.body).ready(function() {
  _doc = document,
  _body = _doc.body,
  _md_body = _doc.getElementById('root');
  _mathEl = _doc.getElementById('MathBuffer');



  $(_body).click(function(e) {
    var origin, href, el = e.target;

    switch (el.tagName.toUpperCase()) {
      case 'A':
        href = el.getAttribute('href') || '';

        if (href.charAt(0) !== '#') {
          e.preventDefault();
          window.ee.emit('link', href);
        }
        break;
      case 'INPUT':
        var isDone = el.checked;
        var index = el.getAttribute('data-task-index');
        window.ee.emit('task.done', el, index, isDone);
        break;
      default:
        e.preventDefault();
        break;
    }
  });

  codeLanguages = hljs.listLanguages();
  mermaid.sequenceConfig = {
    diagramMarginX: 50,
    diagramMarginY: 10,
    boxTextMargin: 5,
    noteMargin: 10,
    messageMargin: 35,
    mirrorActors: true,
    width: 150,
    // Height of actor boxes
    height: 30
  };
  mermaid.ganttConfig = {
    titleTopMargin: 25,
    barHeight: 20,
    barGap: 4,
    topPadding: 50,
    sidePadding: 100,
    gridLineStartPadding: 35,
    fontSize: 11,
    numberSectionStyles: 4,
    axisFormatter: [
      // Within a day
      ["%I:%M",
        function(d) {
          return d.getHours();
        }
      ],
      // Monday a week
      ["w. %U",
        function(d) {
          return d.getDay() == 1;
        }
      ],
      // Day within a week (not monday)
      ["%a %d",
        function(d) {
          return d.getDay() && d.getDate() != 1;
        }
      ],
      // within a month
      ["%b %d",
        function(d) {
          return d.getDate() != 1;
        }
      ],
      // Month
      ["%m-%y",
        function(d) {
          return d.getMonth();
        }
      ]
    ]
  };
  // _body.addEventListener("DOMNodeInserted", function (ev) {
  // console.log(ev.target.tagName);
  // }, false);
});
