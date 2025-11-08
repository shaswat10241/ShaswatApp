# Batch Cost Calculator - Complete Guide

## Overview

The Batch Cost Calculator is an admin tool designed to calculate the per-unit production cost of products by accounting for all production expenses including raw materials, labor, utilities, transportation, marketing, and other miscellaneous costs.

## Key Features

### 1. **Unit Options**
- **Quantity Units**: kg (kilograms) or g (grams) for raw materials
- **Currency**: All costs in Indian Rupees (₹)
- **Electricity**: Measured in kWh (kilowatt-hours)

### 2. **Comprehensive Cost Tracking**
- Raw Material Costs with unit selection (kg/g) and ratio-based calculations
- Labour costs (number of workers × average salary)
- Electricity costs (kWh × cost per kWh)
- Packaging costs (unit cost × number of units)
- Transportation costs (fuel + distance + driver)
- Marketing employee salaries
- Other miscellaneous expenses

### 3. **Dynamic Input Fields**
- Add/remove multiple raw material entries
- Add/remove multiple marketing employees
- Add/remove multiple other expense items
- Real-time calculation updates as you type

### 4. **Cost Analysis**
- Detailed breakdown by category
- Percentage distribution of costs
- Individual item calculations with formulas
- Visual cost categorization with color coding
- Complete formula display for transparency

## Cost Calculation Formula

```
Per Unit Cost = Total Cost ÷ Total Quantity Produced

Where Total Cost = 
  Σ(Raw Material Quantity × Unit Cost × Ratio) +
  (Number of People × Average Salary) +
  (Electricity kWh × Cost per kWh) +
  (Packaging Unit Cost × Number of Units) +
  Fuel Cost (₹) +
  Distance Cost (₹) +
  Driver Cost (₹) +
  Σ(Marketing Employee Salaries) +
  Σ(Other Expense Items)
```

**Note:** Raw material quantities are automatically converted to kg for calculations if entered in grams.

## Step-by-Step Usage Guide

### Step 1: Product Information (Green Section)

1. **Select Product**
   - Choose from dropdown: "SELECT YOUR SKU"
   - Auto-fills product name from existing SKU catalog

2. **Total Quantity Produced**
   - Enter the total number of units you plan to produce
   - This is the denominator in the per-unit cost calculation
   - Example: 1000 units

---

### Step 2: Raw Material Cost (Green Section)

For each raw material:

1. **Item**: Enter the material name
   - Example: "Rice", "Oil", "Sugar"

2. **Quantity**: Enter the amount used
   - Example: 100, 10, 5

3. **Unit**: Select kg or g from dropdown
   - kg: Kilograms
   - g: Grams (automatically converted to kg)

4. **Total Cost (₹)**: Enter the total cost for that quantity
   - Example: ₹5000 for 100kg rice = ₹50/kg

5. **Ratio**: Enter usage efficiency multiplier
   - 1.0 = Normal usage (default)
   - < 1.0 = Less material due to waste/loss
   - > 1.0 = Extra material needed (e.g., evaporation)

**Buttons:**
- **Add More**: Click to add another raw material row
- **Delete (🗑️)**: Remove an item (minimum 1 required)

**Example:**
- Rice: 100 kg, ₹5000, ratio 1.0
- Oil: 10000 g (10kg), ₹800, ratio 0.9
- Spices: 500 g (0.5kg), ₹200, ratio 1.0

---

### Step 3: Basic Expense (Pink Section)

#### **Labour Cost**

1. **No. of People**: Total workers involved in production
   - Example: 5 workers

2. **Average Salary (₹)**: Average wage per worker
   - Example: ₹500 per worker
   - Calculation: 5 × ₹500 = ₹2,500

#### **Electricity**

1. **No. of Units Used (kWh)**: Electricity consumed in kilowatt-hours
   - Check meter readings before/after production
   - Example: 100 kWh

2. **Cost per Unit (₹/kWh)**: Rate per kilowatt-hour
   - Use industrial rate from electricity bill
   - Example: ₹8/kWh
   - Calculation: 100 kWh × ₹8 = ₹800

#### **Packaging**

1. **Unit Cost (₹)**: Cost per individual package
   - Example: ₹2 per packet

2. **No. of Units Used**: Total packages needed
   - Should match quantity produced
   - Example: 1000 packets
   - Calculation: 1000 × ₹2 = ₹2,000

---

### Step 4: Transportation (Blue Section)

1. **Fuel Cost (₹)**: Total fuel expenses
   - Include round trip if applicable
   - Example: ₹500

2. **No. of KMs (₹)**: Distance-based cost
   - Cost associated with kilometers traveled
   - Example: ₹300

3. **Cost of Driver (₹)**: Driver wages/salary
   - Example: ₹800
   - **Total Transportation**: ₹500 + ₹300 + ₹800 = ₹1,600

---

### Step 5: Marketing Cost (Blue Section)

For each marketing employee:

1. **Employee**: Enter employee name
   - Example: "Rajesh Kumar"

2. **Salary (₹)**: Monthly or allocated salary
   - Example: ₹1,000

**Buttons:**
- **Add More**: Add another marketing employee
- **Delete (🗑️)**: Remove employee (minimum 1 required)

**Example:**
- Marketing Employee 1: ₹1,000
- Marketing Employee 2: ₹1,200
- **Total**: ₹2,200

---

### Step 6: Other Expense (Blue Section)

For each miscellaneous expense:

1. **Item**: Enter expense name
   - Example: "Maintenance", "Utilities", "Miscellaneous"

2. **Total Cost (₹)**: Enter cost
   - Example: ₹500

**Buttons:**
- **Add More**: Add another expense item
- **Delete (🗑️)**: Remove item (minimum 1 required)

**Example:**
- Maintenance: ₹500
- Miscellaneous: ₹300
- **Total**: ₹800

---

### Step 7: Calculate & Analyze

#### **Result Cards**

Two large gradient cards display:

1. **Per Unit Cost (Purple Card)**
   - Shows: ₹{Total Cost ÷ Quantity}
   - Example: ₹15.62
   - Sub-text: "₹15,620 ÷ 1000 units"

2. **Total Cost (Pink Card)**
   - Shows: ₹{Grand Total}
   - Example: ₹15,620
   - Sub-text: "Grand total of all expenses"

#### **Action Buttons**

1. **Calculate** (Blue)
   - Confirms calculation and shows results
   - Enables the Analyze button

2. **Analyze Breakdown** (Green)
   - Opens detailed analysis dialog
   - Shows percentage breakdown
   - Displays item-level calculations

3. **Reset** (Red Outline)
   - Clears all data
   - Starts fresh calculation

---

## Analysis Dialog

Click **"Analyze Breakdown"** to open a comprehensive analysis window.

### Summary Cards

Two alert cards at the top:
- **Cost Per Unit** (Blue): ₹15.62
- **Total Production Cost** (Green): ₹15,620

### Category Breakdown Cards

Each expense category displays:

1. **Category Header**
   - Name (e.g., "Raw Material Cost")
   - Total amount (e.g., ₹5,720)
   - Percentage chip:
     - 🔴 Red: > 30% (high cost - needs attention)
     - 🟠 Orange: 15-30% (moderate cost)
     - 🟢 Green: < 15% (low cost)

2. **Item Table**
   - **Item**: Material/expense name
   - **Calculation**: Formula used (e.g., "100kg × ₹50 × 1.0")
   - **Amount**: Calculated cost (e.g., ₹5,000)

3. **Subtotal Row**
   - Bold total for that category

### Formula Display Panel

Gray panel at bottom showing:
- Complete calculation formula
- Step-by-step breakdown
- Final calculation with actual numbers

**Example:**
```
Total Cost = ₹15,620
Quantity Produced = 1000 units
Per Unit Cost = ₹15,620 ÷ 1000 = ₹15.62
```

---

## Complete Example

### Product: Puffed Rice
**Quantity to Produce:** 1000 units

### Input Data:

**Raw Materials:**
- Rice: 100 kg, ₹5,000, ratio 1.0
- Oil: 10 kg, ₹800, ratio 0.9
- Total: ₹5,720

**Basic Expenses:**
- Labour: 5 people × ₹500 = ₹2,500
- Electricity: 100 kWh × ₹8 = ₹800
- Packaging: 1000 units × ₹2 = ₹2,000
- Total: ₹5,300

**Transportation:**
- Fuel: ₹500
- Distance: ₹300
- Driver: ₹800
- Total: ₹1,600

**Marketing:**
- Employee 1: ₹1,000
- Employee 2: ₹1,200
- Total: ₹2,200

**Other Expenses:**
- Maintenance: ₹500
- Miscellaneous: ₹300
- Total: ₹800

### Calculation:

```
Total Cost = ₹5,720 + ₹5,300 + ₹1,600 + ₹2,200 + ₹800
Total Cost = ₹15,620

Per Unit Cost = ₹15,620 ÷ 1000 units
Per Unit Cost = ₹15.62
```

### Cost Distribution:

- Raw Materials: 36.6% (High - largest expense)
- Basic Expenses: 33.9% (High - needs optimization)
- Transportation: 10.2% (Moderate)
- Marketing: 14.1% (Moderate)
- Other: 5.1% (Low)

---

## Understanding Units

### Quantity Units (kg vs g)

**When to use kg:**
- Large quantities (> 1000g)
- Standard bulk materials
- Easier calculations

**When to use g:**
- Small quantities (< 1000g)
- Precise measurements
- Spices, additives, flavoring

**Automatic Conversion:**
- System converts grams to kg for calculations
- 1000g = 1kg
- Example: 500g = 0.5kg in calculations

### Electricity (kWh)

**kWh = Kilowatt-hour**
- Standard unit for electricity consumption
- Found on electricity meter
- 1 kWh = 1000 watts used for 1 hour

**How to measure:**
- Note meter reading before production
- Note meter reading after production
- Difference = kWh consumed

**Example:**
- Start: 12,500 kWh
- End: 12,600 kWh
- Consumed: 100 kWh

### Currency (₹)

- All costs in Indian Rupees
- Rupee symbol (₹) displayed automatically
- Enter amounts without symbols
- System formats as ₹X,XXX.XX

---

## UI Color Guide

### Section Colors:

- **Green (#e8f5e9)**: Product Info & Raw Materials
- **Pink (#fce4ec)**: Basic Expenses (Labour, Electricity, Packaging)
- **Blue (#e3f2fd)**: Transportation, Marketing, Other Expenses

### Result Cards:

- **Purple Gradient**: Per Unit Cost
- **Pink Gradient**: Total Cost

### Percentage Chips:

- **Red**: >30% (Attention needed)
- **Orange**: 15-30% (Monitor closely)
- **Green**: <15% (Efficient)

---

## Tips for Accurate Calculations

### 1. Raw Material Ratios

**Ratio = 1.0** (Standard)
- Normal usage without waste
- Material fully utilized

**Ratio < 1.0** (Less material)
- 0.9 = 10% waste/loss
- 0.8 = 20% waste/loss
- Use when material is wasted in processing

**Ratio > 1.0** (More material)
- 1.1 = 10% extra needed
- 1.2 = 20% extra needed
- Use when material evaporates or expands

### 2. Labour Costs

- Include ALL production workers
- Use average if salaries vary widely
- Consider: hourly rate × hours worked
- Don't include management (put in Other Expenses)

### 3. Electricity Measurement

- Use actual meter readings
- Account for entire production cycle
- Include pre-heating and cool-down time
- Use industrial electricity rates, not domestic

### 4. Transportation

- Include round-trip costs
- Factor in vehicle wear and tear
- Consider fuel price fluctuations
- Account for toll charges in fuel or KM costs

### 5. Marketing Allocation

- Include only direct marketing staff
- Prorate if working on multiple products
- Don't include sales team (separate expense)

### 6. Other Expenses

- Maintenance and repairs
- Quality control costs
- Safety equipment
- Cleaning supplies
- Overhead allocation

---

## Troubleshooting

### Problem: Per Unit Cost shows ₹0.00
**Solution:** Ensure "Total Quantity Produced" is greater than 0

### Problem: Very high per-unit cost
**Possible Causes:**
1. Low quantity produced (dividing by small number)
2. Entered total costs instead of unit costs
3. Wrong unit selected (g instead of kg)

**Solution:** Review all inputs, especially quantity produced

### Problem: Cannot click "Analyze Breakdown"
**Solution:** Click "Calculate" button first

### Problem: Cannot delete row
**Solution:** At least one row must remain in each section

### Problem: Incorrect calculations
**Possible Causes:**
1. Mixed up kg and g units
2. Ratio not set correctly
3. Decimal point errors

**Solution:** Double-check all values and units

---

## Access & Navigation

### Access Requirements:
- **Admin role only**
- Must be authenticated

### How to Access:

**From Dashboard:**
1. Scroll to "Admin Panel" section
2. Click orange "Batch Cost Calculator" card
3. Look for calculator icon 🧮

**Direct URL:**
- Navigate to: `/admin/batch-cost-calculator`

**Return to Dashboard:**
- Click back arrow (←) in top-left corner

---

## Keyboard Shortcuts & Tips

### Navigation:
- **Tab**: Move to next field
- **Shift + Tab**: Move to previous field
- **Enter**: Submit current field (moves to next)

### Input Tips:
- Type numbers without rupee symbol (₹)
- Decimals allowed (e.g., 10.5)
- Use dropdown for units (kg/g)
- Press "Add More" to add rows while staying in section

---

## Best Practices

### Before Starting:
1. ✅ Gather all invoices and receipts
2. ✅ Calculate actual electricity consumption
3. ✅ Have material quantities ready
4. ✅ Know your production quantity

### During Input:
1. ✅ Start with raw materials (usually largest cost)
2. ✅ Be consistent with units (all kg or convert)
3. ✅ Use actual costs, not estimates
4. ✅ Include ALL expenses (even small ones)

### After Calculation:
1. ✅ Review the breakdown analysis
2. ✅ Check which category is highest
3. ✅ Look for optimization opportunities
4. ✅ Compare with current selling price
5. ✅ Save/note the results (future: will save to database)

---

## Understanding the Results

### Per Unit Cost
This is your **break-even price per unit**. You must sell above this price to make profit.

**Example:**
- Per Unit Cost: ₹15.62
- Minimum Selling Price: ₹15.62 (no profit)
- Recommended Selling Price: ₹20-25 (25-60% markup)

### Cost Distribution

**High Percentage (Red, >30%):**
- Your biggest expense
- Focus optimization efforts here
- Negotiate better rates with suppliers
- Consider bulk purchasing

**Moderate (Orange, 15-30%):**
- Significant but manageable
- Monitor regularly
- Look for incremental improvements

**Low (Green, <15%):**
- Minor expense
- Less priority for optimization
- Maintain current efficiency

---

## Future Enhancements

Coming soon:
- 💾 Save calculations to database
- 📊 Historical comparison
- 📈 Cost trend analysis
- 📄 PDF export
- 📧 Email reports
- 🎯 Target cost setting
- 💰 Profit margin calculator
- 🔔 Cost alert notifications

---

## Formula Reference

### Raw Material Cost:
```
For each material:
  If unit is 'g': quantity_kg = quantity / 1000
  If unit is 'kg': quantity_kg = quantity
  
  unit_cost = total_cost / quantity_kg
  material_cost = quantity_kg × unit_cost × ratio

Total Raw Material Cost = Σ(material_cost)
```

### Labour Cost:
```
Total Labour Cost = number_of_people × average_salary
```

### Electricity Cost:
```
Total Electricity Cost = units_used_kWh × cost_per_kWh
```

### Packaging Cost:
```
Total Packaging Cost = packaging_unit_cost × number_of_units
```

### Transportation Cost:
```
Total Transportation Cost = fuel_cost + km_cost + driver_cost
```

### Marketing Cost:
```
Total Marketing Cost = Σ(employee_salaries)
```

### Other Expenses:
```
Total Other Expenses = Σ(expense_items)
```

### Grand Total:
```
Grand Total = Raw Material + Labour + Electricity + 
              Packaging + Transportation + Marketing + 
              Other Expenses
```

### Per Unit Cost:
```
Per Unit Cost = Grand Total ÷ Total Quantity Produced
```

---

## Technical Details

### File Locations:
- Model: `src/models/BatchCost.ts`
- Page: `src/pages/admin/BatchCostCalculatorPage.tsx`
- Route: `/admin/batch-cost-calculator`

### Technologies:
- React 18 with TypeScript
- Material-UI (MUI) v5
- Real-time calculations with React hooks
- Client-side only (no backend calls during calculation)

### Browser Support:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (responsive design)

---

## Support

For questions or issues:
1. Review this guide thoroughly
2. Check all input values are correct
3. Verify units (kg/g) are appropriate
4. Ensure quantity produced is not zero
5. Try the Reset button and start fresh

---

**Last Updated:** December 2024  
**Version:** 1.0.1  
**Status:** ✅ Production Ready with Unit Options