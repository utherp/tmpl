import $ from "../bower_components/jquery/dist/jquery";

document.addEventListener('DOMContentLoaded', function () {
  var _calc_size, mapped_leave = false, jq = $('.shade'), window_shade = jq.get(0),
  shade = {
    collapsed: false,
    immutable: false,
    busy: false,
    collapsing: false,
    height: { full: false, shade: false },
    recheck: true
  };

  if (!jq || !jq.length) return;

  _calc_size = () => {
    if (shade.busy) return !(shade.recheck = true);
    shade.height.shaded = jq.find('.title-row').first().height();
    if (shade.collapsed) return !(shade.recheck = true);
    shade.height.full = jq.height();
    return !(shade.recheck = false);
  };

  self.addEventListener('resize', _calc_size);

  window_shade.toggle_shade = function () { return shade.collapsed ? this.expand_shade() : this.collapse_shade(); };

  window_shade.expand_shade = function () {
    if (shade.busy) return false;
    if (shade.recheck) _calc_size();
    if (!shade.collapsed) return true;
    shade.busy = true; shade.collapsing = false;

    jq.animate( { height: shade.height.full + 'px' }, 600, 'swing', () => ((shade.collapsed = shade.busy = false) || jq.removeClass('shaded').css({ height:null, overflow:null })));

    if (!mapped_leave) {
      this.addEventListener('mouseleave', this.collapse_shade.bind(this));
      mapped_leave = true;
    }

    return true;
  };

  window_shade.collapse_shade = () => {
    if (shade.busy) return false;
    if (shade.recheck) _calc_size();
    if (shade.collapsed) return true;
    shade.busy = shade.collapsing = true;

    jq.css('height', shade.height.full)
      .animate( { height: shade.height.shaded + 'px' }, 1000, 'swing', () => ((shade.busy = false) || ((shade.collapsed = true) && jq.addClass('shaded'))));
    
    return true;
  };

  jq.find('.title-row').get(0).addEventListener('click', window_shade.toggle_shade.bind(window_shade));
  window_shade.addEventListener('mouseenter', window_shade.expand_shade.bind(window_shade));
});

