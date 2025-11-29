// Performance Optimizations Module
// Improves efficiency of common operations

// ==================== DOM Element Cache ====================
const DOMCache = {
    elements: new Map(),

    get(id) {
        if (!this.elements.has(id)) {
            const el = document.getElementById(id);
            if (el) this.elements.set(id, el);
        }
        return this.elements.get(id);
    },

    clear() {
        this.elements.clear();
    },

    // Bulk get for frequently used elements
    getMultiple(ids) {
        return ids.map(id => this.get(id));
    }
};

// Make globally available
window.DOMCache = DOMCache;

// ==================== Optimized Stats Calculation ====================
// Replace the inefficient multi-filter approach with single-pass
window.updateStatsOptimized = function() {
    try {
        // Single pass through contents array (O(n) instead of O(4n))
        const stats = contents.reduce((acc, content) => {
            acc.total++;
            acc[content.status] = (acc[content.status] || 0) + 1;
            return acc;
        }, { total: 0, draft: 0, ready: 0, posted: 0 });

        // Batch DOM updates to minimize reflows
        const updates = [
            ['draftCount', stats.draft],
            ['readyCount', stats.ready],
            ['postedCount', stats.posted],
            ['totalCount', stats.total]
        ];

        // Use cached elements and batch updates
        requestAnimationFrame(() => {
            updates.forEach(([id, value]) => {
                const el = DOMCache.get(id);
                if (el) el.textContent = value;
            });
        });
    } catch (error) {
        console.error('Error updating stats:', error);
    }
};

// ==================== Debounce Utility ====================
window.debounce = function(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ==================== Throttle Utility ====================
window.throttle = function(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ==================== Efficient Rendering ====================
// Use DocumentFragment for batch DOM insertions
window.renderWithFragment = function(items, renderFn) {
    const fragment = document.createDocumentFragment();
    items.forEach(item => {
        const element = renderFn(item);
        if (element) fragment.appendChild(element);
    });
    return fragment;
};

// ==================== Request Animation Frame Queue ====================
const rafQueue = {
    tasks: [],
    scheduled: false,

    add(task) {
        this.tasks.push(task);
        if (!this.scheduled) {
            this.scheduled = true;
            requestAnimationFrame(() => this.flush());
        }
    },

    flush() {
        const tasks = this.tasks.slice();
        this.tasks = [];
        this.scheduled = false;

        tasks.forEach(task => {
            try {
                task();
            } catch (error) {
                console.error('RAF task error:', error);
            }
        });
    }
};

window.rafQueue = rafQueue;

// ==================== Efficient Event Delegation ====================
// Global event delegation for common actions
document.addEventListener('DOMContentLoaded', () => {
    // Delegate all button clicks to avoid multiple listeners
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;

        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        // Map actions to functions
        const actions = {
            'edit': () => window.editContent && window.editContent(Number(id)),
            'delete': () => window.deleteContent && window.deleteContent(Number(id)),
            'seo': () => window.showSEOOptimizer && window.showSEOOptimizer(Number(id)),
            'review': () => window.showScriptReviewer && window.showScriptReviewer(Number(id))
        };

        if (actions[action]) {
            actions[action]();
        }
    });

    // Throttle scroll events
    const handleScroll = throttle(() => {
        // Scroll event handlers here
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
});

// ==================== Memory Management ====================
// Clean up when navigating away
window.addEventListener('beforeunload', () => {
    DOMCache.clear();
});

// ==================== Image Lazy Loading ====================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });

    window.lazyLoadImages = () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    };
}

// ==================== Performance Monitoring ====================
window.perfMonitor = {
    marks: new Map(),

    start(label) {
        this.marks.set(label, performance.now());
    },

    end(label) {
        const start = this.marks.get(label);
        if (start) {
            const duration = performance.now() - start;
            console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
            this.marks.delete(label);
            return duration;
        }
    }
};

console.log('✅ Performance optimizations loaded');
