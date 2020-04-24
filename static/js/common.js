/*
window.console = {};
window.console.log = function(i){return;};
window.console.time = function(i){return;};
window.console.timeEnd = function(i){return;};
*/

var sekiryu = sekiryu || {};

/*スマホのとき*/
var sp = sp || {};


//画像遅延読み込み
window.lazySizesConfig = {
	addClasses: true
};

//imgfitを適用させる
objectFitImages('img.img-ofi');

//スマホかどうか
var isSp;

//DOMがすべて読み込まれたら
$(function() {
  try {

    /* ------------------------------------------------------------ スクロールバー */

    sekiryu.scr = {
      init:function() {
        var w = window.innerWidth - $(window).width();
        //console.log(w);
        if(w != 0) {
          $('.grid').css({
            //safariでカラム落ちるため+1
            width:'calc(100% + '+ Number(w + 1) +'px)',
            //transform:'translateX(' + -w  + 'px)' //NG
            //marginLeft: -w //OK
            position:'relative', //OK
            left:-(Math.round(w/2))
          });
          $('.grid').wrap('<div class="grid-wapper"></div>');
          $('.grid-wapper').css({
            overflow:'hidden'
          });
        }
      }
    },

    /* ------------------------------------------------------------ ヘッダー */

    sekiryu.header = {
      init:function() {
        if($('#artists')[0]) {
          //一番最初に！
          timer = setTimeout(function() {
            sekiryu.header.artistsTtl = Number($('ul#pkz').offset().top + parseInt($('#artists .ttl').css('margin-top'), 10));
            sekiryu.header.fixed();
            sekiryu.header.event();
          }, 200);
        }
        $(".fixedsticky").fixedsticky();
      },
      event:function() {
        var setTimeoutId = null;
        window.addEventListener("scroll", function(){
	        // setTimeoutIdの内容がある場合はキャンセル
	        if( setTimeoutId ) {
		        return false;
	        }
	        // setTimeoutイベントを実行
	        setTimeoutId = setTimeout(function() {
            sekiryu.header.fixed();
		        setTimeoutId = null ;
	        },50);
        });
      },
      fixed:function() {
        //fixedstickyに対してクラス追加したいとき
        var t = $(window).scrollTop();
        //console.log(t +' : '+ sekiryu.header.artistsTtl);
        if (t >= sekiryu.header.artistsTtl) {
          $('#artists .ttl').addClass('mini');
        } else {
          $('#artists .ttl').removeClass('mini');
        }

      }
    },

    /* ------------------------------------------------------------ スライダー */

    sekiryu.slider = {
      init:function() {
        if($('#slider')[0]) {
          sekiryu.slider.random();
          sekiryu.slider.start();
        }
      },
      random:function() {
        $('#slider > div').sort(function() {
          return Math.round(Math.random()) - 0.5;
        }).detach().appendTo($('#slider'));
      },
      start:function() {
        //スライドの数
        var num = $('#slider > div').length;
        var now = 0;
        var slider = $('#slider').slick({
          fade:true,
          autoplay:true,
          pauseOnHover:false,
          autoplaySpeed:5000,
          dots: true,
          arrows:false,
          infinite: true,
          speed:800,
          cssEase: 'cubic-bezier(0.455, 0.03, 0.515, 0.955)'
        });

        $('#slider').on('setPosition', function(slick){
          console.log(now);
          //最初のスライドにクラス追加
          $('#slider .slick-slide').eq(now).addClass('action');
          setTimeout(function(){
            var a = $('.slick-dots li').eq(now).offset();
            $('.circle').css({
              top:a.top,
              left:a.left
            });
          },50);
        });

        slider.slick('setPosition');

        $('#slider').on('beforeChange', function(event, slick, currentSlide, nextSlide){
          now = nextSlide;
          //console.log(nextSlide);
          if(nextSlide == 0) {
            //console.log("aaa");
            $('#slider .slick-slide').eq(num).addClass('action');
            now = 0;
          } else {
            $('#slider .slick-slide').eq(now).addClass('action');
          }
          $('.circle').removeClass('play');
          setTimeout(function(){
            $('.circle').addClass('play');
          },100);
          setTimeout(function(){
            var a = $('.slick-dots li').eq(now).offset();
            $('.circle').css({
              top:a.top,
              left:a.left
            });
          },50);
        });

        //移動し終わったらクラス消す
        $('#slider').on('afterChange', function(event, slick, currentSlide){
          for (var i=0;i<=num;i++) {
            if(i != currentSlide) {
              $('#slider .slick-slide').eq(i).removeClass('action');
            }
          }
        });
      }
    },

    /* ------------------------------------------------------------ トップ */

    sekiryu.top = {
      init:function() {
        if($('.flex#top')[0]) {
          sekiryu.top.artistNameHover();
        }
      },
      artistsShowRandom:function() {
        var t = $('#artists-list #pickup a').length-1;
        var r = Math.random()*t;
        var c = Math.floor(r);
        $('#artists-img li').eq(c).addClass('active');
        $('#artists-list li a').eq(c).parent().addClass('active');
        var target = $('#artists-list li a').eq(c);
        var name = target.attr('data-artist');
        $('#artist-name p').text(name);
        var text = target.attr('data-text');
        $('#artist-name span').html(text);
      },
      artistNameHover:function() {
        $('#artists-list #pickup a').mouseenter(function(e) {
          var name = $(this).attr('data-artist');
          $('#artist-name p').text(name);
          var text = $(this).attr('data-text');
          $('#artist-name span').html(text);
          var num = $('#artists-list #pickup a').index(this);
          //console.log(num);
          $('#artists-img ul li').removeClass('active');
          $('#artists-img ul li').eq(num).addClass('active');
          $('#artists-list #pickup li').removeClass('active');
          $(this).parent().addClass('active');
        });
        $('#artists-list #pickup li').eq(0).mouseenter(function(e) {
          $('#artists-img ul li').removeClass('active');
          $('#artists-img ul li').eq(0).addClass('active');
          $('#artists-list #pickup li').removeClass('active');
          $(this).addClass('active');
        });
      }
    },

    /* ------------------------------------------------------------ アーティスト */

    sekiryu.artists = {
      init:function() {
        if($('.flex#artists')[0]) {
          sekiryu.artists.artListAddEmpty();
          sekiryu.artists.artListResize();
          sekiryu.artists.sortHover();
          sekiryu.artists.sortActive();
          sekiryu.artists.biography();
          var timer = setTimeout(function() {
            sekiryu.artists.artListHW();
          }, 100);
        }
        if($('.flex.collection')[0]) {
          sekiryu.artists.collection();
        }
      },
      collection:function() {
        //遅延読み込みのため、アニメーション中にページ全体の高さが変わっても移動できるように対応
        $('.smooth a').on('click',function() {
          if(isSp) {
            $('.smooth').css('display','none');
            $('#by-artists').removeClass('hover');
          };
          var h;
          if(isSp) {
            h = 151;
          } else {
            h = 62;
          };
          var idx = this.href.indexOf('#');
          var id = this.href.slice(idx);
					if (id != '#') {
						var t = navigator.appName.match(/Opera/) ? 'html' : 'html, body';
            var target = $('[id="' + id.slice(1) + '"]').offset().top - h;
						$(t).animate({
              scrollTop: target},{
                duration:1000,
                easing:'easeInOutExpo',
                step: function( now, tween ){
                  //console.log($('[id="' + id.slice(1) + '"]').offset().top + " : " +now);
                  tween.end = $('[id="' + id.slice(1) + '"]').offset().top - h;
                }
					    });
          };
          return false;
        });
      },
      artListAddEmpty:function() {
        $(".art-list").each(function () {
          var li = $(this).children('li');
          var colNum = parseInt($(this).width() / li.width());
          //console.log('カラム : '+colNum);
          //console.log('カラム数 : '+li.length);
          var n = Math.floor(li.length / colNum);

          if(li.length != 0) {
            //あまりを数える
            var amari;
            var i;
            for (i = 0; i < n; i++) {
              amari = li.length - colNum*n;
            }
            //console.log('あまり : '+ amari);

            //たす分を数える
            if (amari != 0) {
              i = 0;
              do {
                i++;
                $(this).append('<li class="empty"></li>');
              } while (i < Number(colNum - amari));
            };
          }
        });
      },
      artListHW:function() {
        for(var i=0;i<=$('.art-list li').length;i++) {
          var w = $('.art-list li:eq('+ i +') a').width();
          //console.log(w);
          $('.art-list li:eq('+ i +') .art').width(w);
          $('.art-list li:eq('+ i +') .art').height(w);
        }
      },
      artListResize:function() {
        /*リサイズされたとき*/
        var timer = false;
        $(window).resize(function() {
          if (timer !== false) {
            clearTimeout(timer);
          }
          timer = setTimeout(function() {
            sekiryu.artists.artListHW();
          }, 200);
        });
      },
      sortHover:function() {
        if(isSp) {
          //対スマホ用
          $('.sort').on({
            click:function() {
              $(this).toggleClass('hover');
              $(this).find('ul').toggle();
            }
          });
        } else {
          $('.sort').on({
            mouseenter:function(){
              $(this).addClass('hover');
              $(this).find('ul').show();
		        },
		        mouseleave:function(){
              $(this).removeClass('hover');
              $(this).find('ul').hide();
		        }
          });
        }

        //ソート前と同じURLの場合はリロードする
        $('.sort li a').click(function() {
          if($('#by-artists')[0] == undefined) {
            //IEやEdgeでリンクが作動しなくなるため下記の処理
            var url = $(this).attr("href");
            var str = url.substring(url.indexOf("#"),url.length);
            var hash = window.location.hash;
            if(hash == str) {
              location.reload(false);
            };
          }
        });
      },
      sortActive:function() {
        if($('#by-artists')[0] == undefined) {
          var num = $('.sort li').length;
          $('.sort li').each(function(i) {
            $(this).addClass('s'+Number(i+1));
            $(this).find('a').attr('href',$(this).find('a').attr('href')+'#s'+Number(i+1));
          });

          if(window.location.hash) {
            var hash = window.location.hash;
            hash = hash.slice(1);
            //console.log(hash);
            //sが含まれる場合
            if ( hash.indexOf('s') != -1) {
              var txt = $('.'+hash).find('a').text();
              $('.sort .activeParent').parent().prev().find('a').text(txt);
              $('.sort .activeParent').parent().prev().parent().addClass('active');
            }
          }
        }
      },
      biography:function() {
        //元の位置を記憶しておく
        var scrollX;
        $('#btn-bio a').click(function() {
          scrollX = $(window).scrollTop();
          console.log("scrollX : "+ scrollX);
          $('#right').addClass('hide');
          $('#biography').addClass('act');
          $('#artists').outerHeight($('#biography').outerHeight());
          $("html,body").animate({scrollTop:0},0,'linear');
        });
        $('#btn-close a').click(function() {
          $('#biography').removeClass('act');
          $('#right').removeClass('hide');
          $('#artists').removeAttr('style');
          $("html,body").animate({scrollTop:scrollX},0,'linear');
        });
      }
    },

    /* ------------------------------------------------------------ アーティスト詳細 */

    sekiryu.detail = {
      init:function() {
        if($('.flex#detail')[0]) {
          sekiryu.detail.ttlAndUrl();
          sekiryu.detail.thumbSet();
        }
      },
      thumbSet:function() {
        var v1 = $('#art-thumb li').length;
        if(v1 == 1) {
          $('#art-thumb').addClass('deactive');
        }
        sekiryu.detail.imgChange(v1);
      },
      imgChange:function(num) {
        //まずはアクティブ化
        $('#art-img li:eq(0)').addClass('active');
        $('#art-thumb li:eq(0)').addClass('active');

        $('#art-thumb li').hover(function() {
          for (var i=0;i<num;i++) {
            $('#art-img li').eq(i).removeClass('active');
            $('#art-thumb li').eq(i).removeClass('active');
          };
          var v1 = $(this).index();
          $('#art-img li').eq(v1).addClass('active');
          $('#art-thumb li').eq(v1).addClass('active');
        },function() {
        });
      },
      ttlAndUrl:function() {
        var ttl = $('#art-ttl .title').text() +' : '+$('#art-ttl .desc').text();
        var url = location.href;
        var snsTxt = encodeURIComponent(ttl) +' '+url;
        $('.fb').attr('href','https://www.facebook.com/sharer/sharer.php?u=' + url);
        $('.tw').attr('href','https://twitter.com/intent/tweet?text=' + snsTxt);
      }
    },

    /* ------------------------------------------------------------ 展覧会 */

    sekiryu.exhibitions = {
      init:function() {
        if($('.flex#exhibitions')[0]) {
          sekiryu.artists.artListAddEmpty();
          sekiryu.artists.artListHW();
          sekiryu.artists.artListResize();
        }
        if($('.flex#past')[0]) {
          sekiryu.exhibitions.pastAddClass();
          sekiryu.exhibitions.setSize();
          sekiryu.exhibitions.setGallerySize();
        }
      },
      setSize:function() {
        document.addEventListener('lazybeforeunveil', function(e){
          var bg = e.target.getAttribute('data-bg');
          if(bg){
            e.target.style.backgroundImage = 'url(' + bg + ')';
            var image = new Image();
            var w;
            var h;
            var p;
            image.onload = function(){
              w = image.width;
              h = image.height;
              p = h / w;
              //console.log(p * 100);
              //$(e.target).css('paddingTop',p * 100 * (3 / 5) + '%');
              //w : 100 = h : 103;
              $(e.target).append('<span></span>');
              $(e.target).children('span').css('paddingTop',p * 100 + '%');
              $(e.target).children('span').width('100%');
            };
            image.src = bg;
          }
        });
      },
      setGallerySize:function() {
        $('.gallery a').each(function() {
          var image = new Image();
          var w;
          var h;
          var p;
          var owner = this;
          image.onload = function(){
            w = image.width;
            h = image.height;
            p = 400 / h;
            //console.log(w+' : '+h);
            $(owner).attr('data-size',Math.round(w*0.75)+'x'+Math.round(h*0.75));
          };
          image.src = $(this).attr('href');
        });
        /*
          $('figure a').each(function() {
          $(this).height($(this).parent().width());
          $(this).width($(this).parent().width());
          });
        */
      },
      pastAddClass:function() {
        $('#past-nav-child li').each(function() {
          var c = $(this).children('a').text();
          $(this).addClass('y' + c);
        });
        $('#past-nav-child li').click(function() {
          window.location.hash = $(this).attr('class');
          sekiryu.exhibitions.hashCheck();
          $('body,html').scrollTop(0);
        });
        $('.fbtn a').click(function() {
          window.location.hash = $(this).attr('href');
          sekiryu.exhibitions.hashCheck();
          $('body,html').scrollTop(0);
        });
        sekiryu.exhibitions.hashCheck();
      },
      hashCheck:function() {
        if(window.location.hash) {
          var hash = window.location.hash;
          hash = hash.slice(1);
          $('#past-wrap > div').removeClass('show');
          $('#past-wrap > .' + hash).addClass('show');
          //console.log(hash);
          $('.past-box,.fbtn,.yttl').removeClass('show');
          $('.'+ hash +' .past-box').each(function() {
            $(this).addClass('show');
          });
          $('.'+ hash +' .fbtn').addClass('show');
          $('.'+ hash +' .yttl').addClass('show');

          $('#past-nav-child li a').removeClass('active');
          $('#past-nav-child li.' + hash).children('a').addClass('active');

          //最後に実行する
          sekiryu.exhibitions.more();
          sekiryu.exhibitions.setGallerySize();
        } else {
          //ハッシュがない場合は、最新の年を追加
          var c = $('#past-nav-child li:first').attr('class');
          window.location.hash = c;
          sekiryu.exhibitions.hashCheck();
        }
      },
      more:function() {
        //console.log(isSp);
        //スマホだったらmore判定
        if(isSp) {
          //console.log("abc");
          $('.show .more').each(function() {
            //250px以上あったら
            console.log("txtのサイズ : " + $(this).prev().height());
            if ($(this).prev().height() > 230) {
              $(this).prev().wrap('<div class="more-txt"></div>');
              $(this).children('a').click(function() {
                $(this).toggleClass('up');
                $(this).parent().prev().toggleClass('open');
                if ($(this).hasClass('up')) {
                  $(this).text('eeeeCLOSE');
                } else {
                  $(this).text('READ MORE');
                }
              });
              $(this).css('display','block');
            } else {
              $(this).css('display','none');
            };
          });
        } else {
          $('.show .more').css('display','none');
        }
      }
    },

    /* ------------------------------------------------------------ アクセス */

    sekiryu.about = {
      init:function() {
        //mapクラスが存在していたら
        if($('.map')[0]) {
          sekiryu.about.matsumoto();
          sekiryu.about.aoyama();
        }
      },
      matsumoto:function() {
        // マップオブジェクト
        var stylesArray = [{
          elementType: 'MapTypeStyleElementType',
          featureType: 'MapTypeStyleFeatureType',
          stylers:[{
            Saturation:-100,
            Lightness:	-10,
            Gamma:	0.6
          }]
        }];
        var mapdiv = document.getElementById('map-matsumoto');
        var myOptions = {
          zoom: 14,
          center: new google.maps.LatLng(36.225365,137.98002),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          scaleControl: true
        };
        /*
          var image = {
          url : '/common/img/pin.png',
          scaledSize : new google.maps.Size(47, 62)
          };
        */
        var map = new google.maps.Map(mapdiv, myOptions);
        map.setOptions({styles:stylesArray});
	      var marker = new google.maps.Marker({
          position: new google.maps.LatLng(36.225365,137.98002),
          map: map,
          title: ''
	        //icon: image
	      });
      },
      aoyama:function() {
        // マップオブジェクト
        var stylesArray = [{
          elementType: 'MapTypeStyleElementType',
          featureType: 'MapTypeStyleFeatureType',
          stylers:[{
            Saturation:-100,
            Lightness:	-10,
            Gamma:	0.6
          }]
        }];
        var mapdiv = document.getElementById('map-aoyama');
        var myOptions = {
          zoom: 15,
          center: new google.maps.LatLng(35.670313,139.725646),
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          scaleControl: true
        };
        /*var image = {
          url : '/common/img/pin.png',
          scaledSize : new google.maps.Size(47, 62)
          };
        */
        var map = new google.maps.Map(mapdiv, myOptions);
        map.setOptions({styles:stylesArray});
	      var marker = new google.maps.Marker({
          position: new google.maps.LatLng(35.670313,139.725646),
          map: map,
          title: ''
	        //icon: image
	      });
      }
    };

    /* ------------------------------------------------------------ お問い合わせ */

    sekiryu.contact = {
      init:function() {
        if($('.flex#contact')[0]) {
          //：を改行に置換
          sekiryu.contact.thAtEng();
          //高さを合わせる
          $('#buy, #sell').height($('#form').height());
          sekiryu.contact.changeBtn();
          //フォームに作家名と作品名を代入する
          sekiryu.contact.inputValue();
        }
      },
      thAtEng:function() {
        $('#tbl-contact th').each(function(i) {
          var txt = $(this).html();
          switch (txt) {
          case 'ご要望':
            txt = 'ご要望<span>Type</span>';
            break;
          case 'お名前':
            txt = 'お名前<span>Name</span>';
            break;
          case 'メールアドレス':
            txt = 'メールアドレス<span>Email</span>';
            break;
          case '電話番号':
            txt = '電話番号<span>Tel</span>';
            break;
          case '郵便番号':
            txt = '郵便番号<span>Pincode</span>';
            break;
          case 'ご住所':
            txt = 'ご住所<span>Address</span>';
            break;
          case '作家名':
            txt = '作家名<span>Artist</span>';
            break;
          case '作品名':
            txt = '作品名<span>Title</span>';
            break;
          case 'お問い合わせ内容':
            txt = 'お問い合わせ内容<span>Inquiries</span>';
            break;
          case 'ダイレクトメール':
            txt = '展覧会ニュースレター、<br>ダイレクトメール<span>Newsletter</span>';
            break;
          }
          $(this).html(txt);
        });
      },
      changeBtn:function() {
        var now = 'form';
        $('#btn-buy').click(function() {
          if(now == 'buy') {
            now = 'form';
            $(this).text('AAA作品購入までの流れ');
            $(this).removeClass('act');
          } else if (now == 'sell') {
            now = 'buy';
            $('#btn-sell').text('BBB作品購入までの流れ');
            $('#btn-sell').removeClass('act');
            $(this).text('CLOSE');
            $(this).addClass('act');
          } else {
            now = 'buy';
            $(this).text('CLOSE');
            $(this).addClass('act');
          }
          sekiryu.contact.changeCont(now);
        });
        $('#btn-sell').click(function() {
          if(now == 'sell') {
            now = 'form';
            $(this).text('CCC作品売却までの流れ');
            $(this).removeClass('act');
          } else if (now == 'buy') {
            now = 'sell';
            $('#btn-buy').text('DDD作品購入までの流れ');
            $('#btn-buy').removeClass('act');
            $(this).text('CLOSE');
            $(this).addClass('act');
          } else {
            now = 'sell';
            $(this).text('CLOSE');
            $(this).addClass('act');
          }
          sekiryu.contact.changeCont(now);
        });
        // add by Shinji.Y --------- ここから↓
        $('#btn-buy_e').click(function() {
          if(now == 'buy') {
            now = 'form';
            $(this).text('Flow to purchase');
            $(this).removeClass('act');
          } else if (now == 'sell') {
            now = 'buy';
            $('#btn-sell').text('BBB Flow to purchase');
            $('#btn-sell').removeClass('act');
            $(this).text('CLOSE');
            $(this).addClass('act');
          } else {
            now = 'buy';
            $(this).text('CLOSE');
            $(this).addClass('act');
          }
          sekiryu.contact.changeCont(now);
        });
        $('#btn-sell_e').click(function() {
          if(now == 'sell') {
            now = 'form';
            $(this).text('Flow to Sell');
            $(this).removeClass('act');
          } else if (now == 'buy') {
            now = 'sell';
            $('#btn-buy').text('BBB Flow to purchase');
            $('#btn-buy').removeClass('act');
            $(this).text('CLOSE');
            $(this).addClass('act');
          } else {
            now = 'sell';
            $(this).text('CLOSE');
            $(this).addClass('act');
          }
          sekiryu.contact.changeCont(now);
        });
        // add by Shinji.Y --------- ここまで↑
      },
      changeCont:function(now) {
        switch (now) {
        case "buy":
          $('#form').removeClass('act');
          $('#buy').addClass('act');
          $('#sell').removeClass('act');
          break;
        case "sell":
          $('#form').removeClass('act');
          $('#buy').removeClass('act');
          $('#sell').addClass('act');
          break;
        default :
          $('#form').addClass('act');
          $('#buy').removeClass('act');
          $('#sell').removeClass('act');
          break;
        }
      },
      inputValue:function() {
        // 最初の1文字 (?記号) を除いた文字列を取得する
        var query = document.location.search.substring(1);

        // クエリの区切り記号 (&) で文字列を配列に分割する
        var parameters = query.split('&');

        var result = new Object();
        for (var i = 0; i < parameters.length; i++) {
          // パラメータ名とパラメータ値に分割する
          var element = parameters[i].split('=');
          var paramName = element[0];
          var paramValue = element[1];
          // パラメータ名をキーとして連想配列に追加する
          result[paramName] = paramValue;
        }
        if(result['artist']) {
          var a = UnescapeSJIS(result['artist']);
          a = a.replace(/&nbsp;/g, " ");
          $("input[name='artist']").attr('value',a);
        }
        if(result['title']) {
          var t = UnescapeSJIS(result['title']);
          t = t.replace(/&nbsp;/g, " ");
          $("input[name='title']").attr('value',t);
        }
      }
    },

    /* ------------------------------------------------------------ 共通 */

    sekiryu.selectLang = {
      init:function() {
        $('#lang-select').on('change', function() {
          var path = location.pathname.split('/').splice(2).join('/');
          if (path) {
            location.href = '/' + $(this).val() + '/' + path;
          } else {
            location.href = '/' + $(this).val() + '/';
          }
        });
      }
    },
    sekiryu.hashCheck = {
      //ハッシュがあっても
      //idが存在しない場合は何もしない
      //idがあったらページ内リンク調整
      init:function() {
        if(window.location.hash) {
          var hash = window.location.hash;
          hash = hash.slice(1);
          //console.log(hash);
          if($('[id="' + hash + '"]')[0] == undefined) {
            //console.log('存在しない');
          } else {
            console.log('存在する');
            setTimeout(function(){
              var h;
              if(isSp) {
                h = 151;
              } else {
                h = 62;
              }
						  var t = navigator.appName.match(/Opera/) ? 'html' : 'html, body';
              var target = $('[id="' + hash + '"]').offset().top - h;
              console.log(target);
              $(window).scrollTop(0);
						  $(t).delay(100).animate({
                scrollTop: target},{
                  duration:500,
                  easing:'easeInOutExpo',
                  step: function( now, tween ){
                    //console.log($('[id="' + id.slice(1) + '"]').offset().top + " : " +now);
                    tween.end = $('[id="' + hash + '"]').offset().top - h;
                  }
					      });
            },100);
          }
        }
      }
    },
    sekiryu.svg = {
      init:function() {
        deSVG('#refine-btn img', true);
      }
    },
    sekiryu.plugin = {
      toggleText:function(t, t1, t2) {
        if (t.text() == t1) {
          t.text(t2);
        } else {
          t.text(t1);
        }
      }
    },
    sekiryu.anker = {
      initPc:function() {
	      $('#pagetop a').smoothLink({
		      speed:1000,
		      easing:'easeInOutExpo',
          marginTop:0
	      });
      },
      initSp:function() {
	      $('#pagetop a').smoothLink({
		      speed:1000,
		      easing:'easeInOutExpo',
          marginTop:0
	      });
      }
    };

    sp.artistsNav = {
      init:function() {
        sp.artistsNav.click();
      },
      click:function() {
        $('#artists-nav p a').on('click',function() {
          $('#wrapper').toggleClass('show');
          $('#artists-nav p').toggleClass('action');
          $('#artists-nav ul').slideToggle(300);
        });
      }
    },
    sp.gnav = {
      init:function() {
        sp.gnav.click();
      },
      click:function() {
        $('#sp-menu').on('click',function() {
          $(this).toggleClass('action');
          $('#nav').fadeToggle();
          $('#nav ul').toggleClass('action');
        });
      }
    },
    sp.search = {
      init:function() {
        sp.search.click();
      },
      click:function() {
        $('#search-icon').on('click',function() {
          $('#search').toggle();
          $('#logo').toggleClass('action');
          $('#search-txt').focus();
        });
      }
    },
    sp.tel = {
      init:function() {
        $('.tel-link img').each(function () {
          var alt = $(this).attr('alt');
          $(this).wrap($('<a>').attr('href', 'tel:' + alt.replace(/-/g, '')));
        });
        $('.tel-linktext').each(function () {
          var str = $(this).text();
          $(this).addClass('sp-tel-linktext');
          $(this).html($('<a>').attr('href', 'tel:' + str.replace(/-/g, '')).append(str + '</a>'));
        });
      }
    },
    sp.top = {
      init:function() {
        sp.top.artists();
      },
      artists:function() {
        $('#pickup a').each(function() {
          var img = $(this).attr('data-img');
          $(this).css('background-image', 'url('+img+')');
          //var artist = $(this).attr('data-artist');
          var text = $(this).attr('data-text');
          $(this).append('<p>'+text+'</p>');
        });
      }
    },
    sp.artists = {
      initSp:function() {
        $('#btn-bio').insertAfter('.ttl');
      },
      initPc:function() {
        $('#btn-bio').insertBefore('#sort-wrap');
      }
    };
  } catch(e) {};
});

//画像もすべて読み込まれたら
$(window).on("load", function(){
  $.ready.then(function(){

    /*ナビゲーション*/
    $('#nav li').navigation({});
    $('#utility li').navigation({});

    $('.pager li').navigation();
    $('.sort li').navigation();

    $(window).breakPoint({
      smartPhoneWidth: 767,
      tabletWidth: 0,
      pcMediumWidth: 1600,
      onPcEnter: function() {
        isSp = false;
        sekiryu.scr.init();
        sekiryu.anker.initPc();
        sekiryu.top.artistsShowRandom();
        sp.artists.initPc();
      },
      onPcLeave: function() {
      },
      onPcMediumEnter:function() {
        isSp = false;
        sekiryu.scr.init();
        sekiryu.anker.initPc();
        sekiryu.top.artistsShowRandom();
        sp.artists.initPc();
      },
      onSmartPhoneEnter: function() {
        isSp = true;
        sekiryu.anker.initSp();
        sp.artistsNav.init();
        sp.search.init();
        sp.gnav.init();
        sp.top.init();
        sp.tel.init();
        sp.artists.initSp();
      },
      onSmartPhoneLeave: function() {
        $('#artists-img ul').slick('unslick');
      }
    });

    sekiryu.header.init();
    sekiryu.top.init();
    sekiryu.artists.init();
    sekiryu.detail.init();
    sekiryu.exhibitions.init();
    sekiryu.about.init();
    sekiryu.contact.init();
    sekiryu.selectLang.init();
    sekiryu.hashCheck.init();
    sekiryu.slider.init();
    //sekiryu.svg.init();

  });
});
