# Development Notes

## React Photo Album Spacing Customization

### Current Setup
- Using `react-photo-album` with masonry layout
- Default spacing: 12px uniform (horizontal and vertical)
- Configured via `spacing={12}` prop in `MasonryGallery.tsx:82`

### To Customize Vertical Spacing (Different from Horizontal)

If you need different vertical spacing (e.g., 24px bottom, 12px horizontal):

1. Keep the `spacing={12}` prop in the component for horizontal spacing
2. Add CSS override in `src/index.css`:

```css
/* Custom spacing: 12px horizontal, 24px vertical */
.react-photo-album--masonry .react-photo-album--track {
  row-gap: 24px !important;
}
```

### How it Works
- The `spacing` prop controls both horizontal width calculations and default row-gap
- The CSS override specifically targets the `row-gap` property to change vertical spacing
- Horizontal spacing remains controlled by the component's width calculations

### Files Modified
- `src/index.css` - Add the CSS override
- Component itself doesn't need changes beyond the original `spacing` prop