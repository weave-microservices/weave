const hrTime = require('./time');

function defineReadonlyProperty (instance, propName, value, readOnly = false) {
  Object.defineProperty(instance, propName, {
    value,
    writable: !!readOnly,
    enumerable: false
  });
}

// transform this factory function into a class
exports.Span = class Span {
  constructor (tracer, name, options) {
    defineReadonlyProperty(this, 'tracer', tracer, true);
    // defineReadonlyProperty(this, 'logger', this.tracer.logger, true);
    defineReadonlyProperty(this, 'options', options || {});
    defineReadonlyProperty(this, 'meta', {});

    this.name = name;
    this.id = options.id || tracer.runtime.generateUUID();
    this.traceId = options.traceId || this.id;
    this.parentId = options.parentId;
    this.type = options.type || 'custom';
    this.sampled = options.sampled || tracer.shouldSample();
    this.tags = {};

    if (options.service) {
      this.service = {
        name: options.service.name,
        version: options.service.version,
        fullyQualifiedName: options.service.fullyQualifiedName
      };
    }

    if (options.defaultTags) {
      this.addTags(options.defaultTags);
    }

    if (options.tags) {
      this.addTags(options.tags);
    }
  }

  addTags (tags) {
    Object.assign(this.tags, tags);
    return this;
  }

  start (time) {
    this.startTime = time || hrTime();
    if (this.sampled) {
      this.tracer.invokeCollectorMethod('startedSpan', [this]);
    }
    return this;
  }

  startChildSpan (name, options) {
    const parentOptions = {
      parentId: this.id,
      traceId: this.traceId,
      sampled: this.sampled,
      service: this.service
    };
    return this.tracer.startSpan(name, Object.assign(parentOptions, options));
  }

  finish (time) {
    this.finishTime = time || hrTime();
    this.duration = this.finishTime - this.startTime;

    this.tracer.log.debug(`Span "${this.id}" finished`);

    if (this.sampled) {
      this.tracer.invokeCollectorMethod('finishedSpan', [this]);
    }

    return this;
  }

  isActive () {
    return this.finishTime !== null;
  }

  setError (error) {
    this.error = error;
    return this;
  }
};

// exports.createSpan = (tracer, name, options) => {
//   const span = Object.assign({}, {
//     name,
//     id: options.id || tracer.runtime.generateUUID(),
//     traceId: options.traceId || span.id,
//     parentId: options.parentId,
//     type: options.type || 'custom',
//     sampled: options.sampled || tracer.shouldSample(),
//     service: options.service,
//     tags: {}
//   });

//   if (options.service) {
//     span.service = {
//       name: options.service.name,
//       version: options.service.version,
//       fullyQualifiedName: options.service.fullyQualifiedName
//     };
//   }

//   span.addTags = (tags) => {
//     Object.assign(span.tags, tags);
//     return span;
//   };

//   span.start = (time) => {
//     span.startTime = time || hrTime();
//     if (span.sampled) {
//       tracer.invokeCollectorMethod('startedSpan', [span]);
//     }
//     return span;
//   };

//   span.startChildSpan = (name, options) => {
//     const parentOptions = {
//       parentId: options.parentId,
//       sampled: options.sampled
//     };
//     return tracer.startSpan(name, Object.assign(parentOptions, options));
//   };

//   span.finish = (time) => {
//     span.finishTime = time || hrTime();
//     span.duration = span.finishTime - span.startTime;

//     tracer.log.debug(`Span "${span.id}" finished`);

//     if (span.sampled) {
//       tracer.invokeCollectorMethod('finishedSpan', [span]);
//     }

//     return span;
//   };

//   span.isActive = () => span.finishTime !== null;

//   span.setError = (error) => {
//     span.error = error;
//     return span;
//   };

//   if (options.tags) {
//     span.addTags(options.tags);
//   }

//   return span;
// };
