(function($){
  function trim(el) {
    return (''.trim) ? el.val().trim() : $.trim(el.val());
  }
  $.fn.isHappy = function (config) {
    var fields = [], item;
    
    function getError(error) {
      return $('<span id="'+error.id+'" class="unhappyMessage">'+error.message+'</span>');
    }
    function handleSubmit() {

      var errors = false, i, l;
      for (i = 0, l = fields.length; i < l; i += 1) {
        if (!fields[i].testValid(true, i)) {
          errors = true;
        }
      }

      if (errors) {
        if (isFunction(config.unHappy)) config.unHappy();
        $(this).data('invalid', true);
        return false;
      } else if (config.testMode) {
        if (window.console) console.warn('would have submitted');
        return false;
      }

      $(this).data('invalid', false);

    }
    function isFunction (obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }
    function processField(opts, selector) {

      var field = $(selector),
        slice =  /^#/.test(selector) ? 1 : 0,
        error = {
          message: opts.message,
          id:selector.slice(slice) + '_unhappy'
        },
        errorEl = $(error.id).length > 0 ? $(error.id) : getError(error);
        
      fields.push(field);

      field.testValid = function (submit, i) {

        if ( !this[0] ) {
            if ( window && window.console ) {
                console.warn('Form validation: An input field that does not have correct identifier attribute. Field index:', i);
            }
            return false;
        }
        var val,
          el = $(this),
          gotFunc,
          error = false,
          temp, 
          required = !!el.get(0).attributes.getNamedItem('required') || opts.required,
          password = (field.attr('type') === 'password'),
          arg = isFunction(opts.arg) ? opts.arg() : opts.arg;

        // clean it or trim it
        if (isFunction(opts.clean)) {
          val = opts.clean(el.val());
        } else if (!opts.trim && !password) {
          val = trim(el);
        } else {
          val = el.val();
        }

        
        // write it back to the field
        el.val(val);

        // checkboxes and radio buttons need a different approach
        if ( el[0].type === 'checkbox' || el[0].type === 'radio' ) {
            val = el.is(':checked') ? 'checked' : '';
        }

        // Legacy browser placeholder fix (just make sure to add the hasPlaceholder boolean when doing placeholder hacks)
        if ( el[0].hasPlaceholder ) {
          val = '';
        }

        // get the value
        gotFunc = ((val.length > 0 || required === 'sometimes') && isFunction(opts.test));
        
        // check if we've got an error on our hands
        var check = submit === true || submit.type === 'blur';

        if (check === true && required === true && val.length === 0) {
          error = true;
        } else if (gotFunc) {
          if (!( val.length === 0 && required === 'sometimes')) {
              error = !opts.test(val, arg);
          }
        }
        
        if (error) {
          var pos = config.errorPosition === 'after' ? 'after' : 'before';
          el.addClass('unhappy');
          if ( el[0].getAttribute('data-nomessage') === null) {
              el[pos](errorEl);
          }
          return false;
        } else {
          temp = errorEl.get(0);
          // this is for zepto
          if (temp.parentNode) {
            temp.parentNode.removeChild(temp);
          }
          el.removeClass('unhappy');
          return true;
        }
      };

      if ( !config.onlySubmit ) {
        field.bind(config.when || 'blur', field.testValid);
      }
    }
    
    for (item in config.fields) {
      processField(config.fields[item], item);
    }
    
    if (config.submitButton) {
      $(config.submitButton).click(handleSubmit);
    } else {
      this.bind('submit', handleSubmit);
    }
    return this;
  };
})(this.jQuery || this.Zepto);
