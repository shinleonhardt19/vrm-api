// EXPRESSION CONROLLER

export class ExpressionController {
    constructor(vrm, eyeController = null) {
        this.vrm = vrm;
        this.eyeController = eyeController; // Receovomg eyecontroller
        this.currentFaceExpression = null;

        // Define which expression to turn off  blink
        this.expressionsWithBlink = [
            'happy',      
            'happyEyes',    
        ];
    }

    setEyeController(eyeController) {
        this.eyeController = eyeController;
        console.log("✅ EyeController linked to ExpressionController");
    }

    resetAllExpressions() {
        if (!this.vrm) return;

        const faceExpressions = [
            'happy', 'angry', 'sad', 'relaxed', 'surprised', 
            'neutral', 'happyEyes', 'BronyaFace1', 'BronyaFace2'
        ];
        
        faceExpressions.forEach(expr => {
            this.vrm.expressionManager.setValue(expr, 0);
        });

        this.currentFaceExpression = null;

        // whenever reset back to neutral, blink is automatically turned on
        if (this.eyeController) {
            this.eyeController.enableBlink();
        }
    }

    setFaceExpression(expressionName) {
        if (!this.vrm) return;

        // Reset all face expressions first
        this.resetAllExpressions();

        // Set new expression
        this.vrm.expressionManager.setValue(expressionName, 1.0);
        this.currentFaceExpression = expressionName;

        // Turn off or turn on  blink dependon expression
        if (this.eyeController) {
            if (this.expressionsWithBlink.includes(expressionName)) {
                // This expression has its own blink -> turn off auto-blink
                this.eyeController.disableBlink();
                console.log(`"${expressionName}": Auto-blink DISABLED (expression has own blink)`);
                console.log(`Blink status:`, this.eyeController.isBlinkEnabled());
            } else {
                // This expression doesnt have its own blink -> turn on auto-blink
                this.eyeController.enableBlink();
                console.log(`"${expressionName}": Auto-blink ENABLED`);
                console.log(`Blink status:`, this.eyeController.isBlinkEnabled());
            }
        } else {
            console.warn(`EyeController not linked to ExpressionController!`);
        }

        console.log(`Set expression: "${expressionName}"`);
        console.log(`Expressions with own blink:`, this.expressionsWithBlink);
    }

    addExpressionWithBlink(expressionName) {
        if (!this.expressionsWithBlink.includes(expressionName)) {
            this.expressionsWithBlink.push(expressionName);
            console.log(`Added "${expressionName}" to expressions with own blink`);
        }
    }

    removeExpressionWithBlink(expressionName) {
        const index = this.expressionsWithBlink.indexOf(expressionName);
        if (index > -1) {
            this.expressionsWithBlink.splice(index, 1);
            console.log(`Removed "${expressionName}" from expressions with own blink`);
        }
    }

    getExpressionsWithBlink() {
        return [...this.expressionsWithBlink];
    }

    hasOwnBlink(expressionName) {
        return this.expressionsWithBlink.includes(expressionName);
    }
}
