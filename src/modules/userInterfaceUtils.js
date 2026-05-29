// UI CONTROLLER
export class uiController {
    constructor(poseState) {
        this.poseState = poseState; 
    }
    createSlider(label, limb, axis, min, max, step, defaultValue) {
        const container = document.createElement("div");
        
        container.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        `;
        const labelEl = document.createElement("label");
        labelEl.textContent = label;
        labelEl.style.cssText = `
            width: 150px;
            font-size: 12px;
            color: white;
        `;

        const slider = document.createElement("input");
        slider.type = "range";
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = defaultValue;
        slider.style.cssText = `flex: 1;`;

        const valueDisplay = document.createElement("span");
        valueDisplay.textContent = defaultValue.toFixed(2);
        valueDisplay.style.cssText = `
            width: 50px;
            font-size: 12px;
            color: white;
            text-align: right;
        `;

        slider.oninput = (e) => {
            const value = parseFloat(e.target.value);
            this.poseState[limb][axis] = value;
            valueDisplay.textContent = value.toFixed(2);
        };

        container.appendChild(labelEl);
        container.appendChild(slider);
        container.appendChild(valueDisplay);

        return container;
    }
}