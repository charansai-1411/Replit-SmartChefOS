# Platform Logic Quick Reference Guide

## Platform Dependency Rules

### The Golden Rule
**Restaurant is the Master Platform**
- All other platforms (Zomato, Swiggy, Other) depend on Restaurant
- Restaurant can exist independently
- Zomato, Swiggy, and Other are independent of each other

## Platform Toggle Scenarios

### Scenario 1: Turning OFF Restaurant
```
Before: Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✓
Action: Turn OFF Restaurant
After:  Restaurant ✗, Zomato ✗, Swiggy ✗, Other ✗

Result: All platforms automatically disabled
Message: "Restaurant disabled. All other platforms have been disabled automatically."
```

### Scenario 2: Turning OFF Zomato
```
Before: Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✓
Action: Turn OFF Zomato
After:  Restaurant ✓, Zomato ✗, Swiggy ✓, Other ✓

Result: Only Zomato is disabled, others remain unchanged
Message: No message (normal toggle)
```

### Scenario 3: Turning OFF Swiggy
```
Before: Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✓
Action: Turn OFF Swiggy
After:  Restaurant ✓, Zomato ✓, Swiggy ✗, Other ✓

Result: Only Swiggy is disabled, others remain unchanged
Message: No message (normal toggle)
```

### Scenario 4: Turning OFF Other
```
Before: Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✓
Action: Turn OFF Other
After:  Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✗

Result: Only Other is disabled, others remain unchanged
Message: No message (normal toggle)
```

### Scenario 5: Trying to Enable Zomato without Restaurant
```
Before: Restaurant ✗, Zomato ✗, Swiggy ✗, Other ✗
Action: Try to turn ON Zomato
After:  Restaurant ✗, Zomato ✗, Swiggy ✗, Other ✗

Result: Action blocked, nothing changes
Message: "Please enable Restaurant platform first before adding other platforms."
```

### Scenario 6: Enabling Restaurant First, Then Others
```
Step 1: Turn ON Restaurant
After:  Restaurant ✓, Zomato ✗, Swiggy ✗, Other ✗

Step 2: Turn ON Zomato
After:  Restaurant ✓, Zomato ✓, Swiggy ✗, Other ✗

Step 3: Turn ON Swiggy
After:  Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✗

Step 4: Turn ON Other
After:  Restaurant ✓, Zomato ✓, Swiggy ✓, Other ✓

Result: All platforms enabled successfully
```

## Platform Independence Matrix

| Action | Restaurant | Zomato | Swiggy | Other |
|--------|-----------|--------|--------|-------|
| Turn OFF Restaurant | ✗ | ✗ | ✗ | ✗ |
| Turn OFF Zomato | ✓ | ✗ | ✓ | ✓ |
| Turn OFF Swiggy | ✓ | ✓ | ✗ | ✓ |
| Turn OFF Other | ✓ | ✓ | ✓ | ✗ |

**Legend:**
- ✓ = Platform remains ON
- ✗ = Platform turns OFF

## Visual States

### Platform Toggle Card States

#### 1. Restaurant - Enabled
```
┌─────────────────────────────────────────────────┐
│ 🍳 Restaurant                          [ON]     │
│ Primary platform (required)                     │
│ Border: Blue, Background: Light blue tint       │
└─────────────────────────────────────────────────┘
```

#### 2. Restaurant - Disabled
```
┌─────────────────────────────────────────────────┐
│ 🍳 Restaurant                          [OFF]    │
│ Primary platform (required)                     │
│ Border: Gray, Background: None                  │
└─────────────────────────────────────────────────┘
```

#### 3. Zomato - Enabled (Restaurant is ON)
```
┌─────────────────────────────────────────────────┐
│ 📦 Zomato                              [ON]     │
│ Border: Blue, Background: Light blue tint       │
└─────────────────────────────────────────────────┘
```

#### 4. Zomato - Disabled (Restaurant is ON)
```
┌─────────────────────────────────────────────────┐
│ 📦 Zomato                              [OFF]    │
│ Border: Gray, Background: None                  │
└─────────────────────────────────────────────────┘
```

#### 5. Zomato - Locked (Restaurant is OFF)
```
┌─────────────────────────────────────────────────┐
│ 📦 Zomato                              [OFF]    │
│ Enable Restaurant first                         │
│ Border: Gray, Background: None, Opacity: 50%    │
│ Switch: Disabled (grayed out)                   │
└─────────────────────────────────────────────────┘
```

## Item Card Platform Badges

### All Platforms Active
```
┌─────────────────────────────────────────────────┐
│ Paneer Tikka                            ₹250    │
│ Grilled cottage cheese...                       │
│                                                  │
│ [🍳✓] [📦✓] [🚚✓] [⋮✓]                         │
│  Blue   Red  Orange Purple                      │
└─────────────────────────────────────────────────┘
```

### Only Restaurant Active
```
┌─────────────────────────────────────────────────┐
│ Paneer Tikka                            ₹250    │
│ Grilled cottage cheese...                       │
│                                                  │
│ [🍳✓] [📦] [🚚] [⋮]                             │
│  Blue  Gray Gray Gray                           │
└─────────────────────────────────────────────────┘
```

### Restaurant + Zomato Active
```
┌─────────────────────────────────────────────────┐
│ Paneer Tikka                            ₹250    │
│ Grilled cottage cheese...                       │
│                                                  │
│ [🍳✓] [📦✓] [🚚] [⋮]                            │
│  Blue   Red  Gray Gray                          │
└─────────────────────────────────────────────────┘
```

## Platform Tab Counts

### Example Display
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🍳 Restaurant│ │ 📦 Zomato    │ │ 🚚 Swiggy    │ │ ⋮ Other      │
│     (4)      │ │     (3)      │ │     (2)      │ │     (1)      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**Interpretation:**
- 4 items available on Restaurant
- 3 items available on Zomato
- 2 items available on Swiggy
- 1 item available on Other

## Common User Questions

### Q: Why can't I enable Zomato without Restaurant?
**A:** Restaurant is the primary platform. All items must be available in your restaurant before they can be listed on delivery platforms like Zomato.

### Q: What happens if I disable Restaurant?
**A:** All other platforms (Zomato, Swiggy, Other) will automatically be disabled because they depend on Restaurant being active.

### Q: Can I have an item on Swiggy but not on Zomato?
**A:** Yes! As long as Restaurant is enabled, you can independently control Zomato, Swiggy, and Other platforms.

### Q: Can I have an item on Zomato only, without Restaurant?
**A:** No. Restaurant must always be enabled for any other platform to be active.

### Q: If I disable Zomato, does it affect Swiggy?
**A:** No. Zomato, Swiggy, and Other are independent of each other. Disabling one doesn't affect the others.

## Error Prevention

### Blocked Actions
1. ❌ Enabling Zomato when Restaurant is OFF
2. ❌ Enabling Swiggy when Restaurant is OFF
3. ❌ Enabling Other when Restaurant is OFF

### Allowed Actions
1. ✅ Enabling Restaurant at any time
2. ✅ Disabling any platform at any time
3. ✅ Enabling Zomato/Swiggy/Other when Restaurant is ON
4. ✅ Toggling Zomato/Swiggy/Other independently (if Restaurant is ON)

## Best Practices

### Adding a New Item
1. Start with Restaurant enabled (default)
2. Add item details
3. Enable additional platforms as needed
4. Save the item

### Editing Platform Availability
1. Open Edit modal
2. Check current platform status
3. To remove from all platforms: Disable Restaurant
4. To remove from specific platform: Disable that platform only
5. To add to new platform: Ensure Restaurant is ON, then enable the platform
6. Save changes

### Managing Platform Visibility
1. Use platform tabs to view items per platform
2. Use category filter to narrow down items
3. Use search to find specific items
4. Combine all filters for precise control

## Summary

**Remember:**
- 🍳 Restaurant = Master platform (required for all others)
- 📦 Zomato = Independent (requires Restaurant)
- 🚚 Swiggy = Independent (requires Restaurant)
- ⋮ Other = Independent (requires Restaurant)

**Key Rule:**
```
Restaurant OFF → Everything OFF
Restaurant ON → Individual control for Zomato, Swiggy, Other
```
