// Simple script to make accordion work regardless of Bootstrap initialization
document.addEventListener('DOMContentLoaded', function() {
    // Get all accordion buttons
    document.querySelectorAll('.accordion-button').forEach(button => {
      button.addEventListener('click', function() {
        // Get target from data attribute
        const target = this.getAttribute('data-bs-target');
        const collapseElement = document.querySelector(target);
        
        // Close all other accordion items in the same parent
        const parentId = collapseElement.getAttribute('data-bs-parent');
        if (parentId) {
          const parent = document.querySelector(parentId);
          if (parent) {
            parent.querySelectorAll('.accordion-collapse.show').forEach(openItem => {
              if (openItem !== collapseElement) {
                openItem.classList.remove('show');
                const button = document.querySelector(`[data-bs-target="#${openItem.id}"]`);
                if (button) {
                  button.classList.add('collapsed');
                  button.setAttribute('aria-expanded', 'false');
                }
              }
            });
          }
        }
        
        // Toggle the current accordion item
        if (collapseElement.classList.contains('show')) {
          collapseElement.classList.remove('show');
          this.classList.add('collapsed');
          this.setAttribute('aria-expanded', 'false');
        } else {
          collapseElement.classList.add('show');
          this.classList.remove('collapsed');
          this.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });