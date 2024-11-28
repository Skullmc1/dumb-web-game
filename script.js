// Add health tracking variables at the top
let attackerHealth = 100;
let defenderHealth = 100;

// Add cooldown tracking variables
let attackerCooldown = 0;
let defenderCooldown = 0;
const COOLDOWN_TIME = 5; // 5 seconds cooldown

// Add jump state tracking
let defenderJumping = false;
let attackerJumping = false;

// Add keyboard event listener
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    // Prevent repeated keydown events while holding key
    if (event.repeat) return;

    switch(event.key) {
        case 'a':
        case 'A':
            startFight('defender');  // Left robot normal attack
            break;
        case 's':
        case 'S':
            startSpecialAttack('defender');  // Left robot special attack
            break;
        case 'w':
        case 'W':
            jump('defender');
            break;
        case 'ArrowLeft':
            startFight('attacker');  // Right robot normal attack
            break;
        case 'ArrowDown':
            startSpecialAttack('attacker');  // Right robot special attack
            break;
        case 'ArrowUp':
            jump('attacker');
            break;
    }
}

// Update button event listeners to use the same controls
document.getElementById('attackerButton').addEventListener('click', () => startFight('attacker'));
document.getElementById('defenderButton').addEventListener('click', () => startFight('defender'));

// Add special attack event listeners
document.getElementById('attackerSpecial').addEventListener('click', () => startSpecialAttack('attacker'));
document.getElementById('defenderSpecial').addEventListener('click', () => startSpecialAttack('defender'));

function startFight(fighter) {
    const attacker = document.querySelector('.' + fighter);
    const defender = document.querySelector('.' + (fighter === 'attacker' ? 'defender' : 'attacker'));
    const attackerArm = attacker.querySelector('.arm');
    
    // Disable buttons during animation
    disableAllButtons(true);
    
    // Create projectile
    const projectile = document.createElement('div');
    projectile.className = 'projectile';
    
    // Create muzzle flash with different colors for each robot
    const flash = document.createElement('div');
    flash.style.position = 'absolute';
    flash.style.width = '10px';
    flash.style.height = '10px';
    flash.style.borderRadius = '50%';
    
    // Set different colors for each robot's muzzle flash
    if (fighter === 'defender') {
        flash.style.background = '#f00';  // Changed to red for left robot
        flash.style.boxShadow = '0 0 10px #f00';
    } else {
        flash.style.background = '#00f';  // Blue for right robot
        flash.style.boxShadow = '0 0 10px #00f';
    }
    
    // Position projectile and flash based on fighter
    if (fighter === 'attacker') {
        projectile.style.left = '-25px';
        projectile.style.animation = 'shoot-left 0.2s linear';
        attackerArm.style.animation = 'recoil-left 0.2s ease-out';
        flash.style.left = '-25px';
    } else {
        projectile.style.right = '-25px';
        projectile.style.animation = 'shoot-right 0.2s linear';
        attackerArm.style.animation = 'recoil-right 0.2s ease-out';
        flash.style.right = '-25px';
    }
    
    flash.style.animation = 'muzzle-flash 0.2s ease-out';
    
    // Add elements to arm
    attackerArm.appendChild(projectile);
    attackerArm.appendChild(flash);
    
    // Add hit effect after projectile travel time
    setTimeout(() => {
        defender.classList.add('hit');
        const damage = 5;  // Changed to flat 5% damage
        updateHealth(fighter === 'attacker' ? 'defender' : 'attacker', damage);
    }, 150);
    
    // Cleanup
    setTimeout(() => {
        defender.classList.remove('hit');
        attackerArm.removeChild(projectile);
        attackerArm.removeChild(flash);
        disableAllButtons(false);
    }, 400);
}

function startSpecialAttack(fighter) {
    if ((fighter === 'attacker' && attackerCooldown > 0) || 
        (fighter === 'defender' && defenderCooldown > 0)) {
        return;
    }

    const attacker = document.querySelector('.' + fighter);
    const defender = document.querySelector('.' + (fighter === 'attacker' ? 'defender' : 'attacker'));
    const attackerArm = attacker.querySelector('.arm');
    
    disableAllButtons(true);
    
    // Create multiple projectiles for special attack
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const projectile = document.createElement('div');
            projectile.className = 'projectile';
            projectile.style.background = fighter === 'attacker' ? '#00f' : '#f00';  // Blue/Red
            projectile.style.boxShadow = `0 0 10px ${fighter === 'attacker' ? '#00f' : '#f00'}`;
            
            const flash = document.createElement('div');
            flash.style.position = 'absolute';
            flash.style.width = '12px';
            flash.style.height = '12px';
            flash.style.borderRadius = '50%';
            
            if (fighter === 'defender') {
                flash.style.background = '#f00';  // Changed to red for left robot
                flash.style.boxShadow = '0 0 15px #f00';
            } else {
                flash.style.background = '#00f';  // Blue for right robot
                flash.style.boxShadow = '0 0 15px #00f';
            }
            
            if (fighter === 'attacker') {
                projectile.style.left = '-25px';
                projectile.style.animation = 'shoot-left 0.2s linear';
                attackerArm.style.animation = 'recoil-left 0.2s ease-out';
                flash.style.left = '-25px';
            } else {
                projectile.style.right = '-25px';
                projectile.style.animation = 'shoot-right 0.2s linear';
                attackerArm.style.animation = 'recoil-right 0.2s ease-out';
                flash.style.right = '-25px';
            }
            
            flash.style.animation = 'muzzle-flash 0.2s ease-out';
            
            attackerArm.appendChild(projectile);
            attackerArm.appendChild(flash);
            
            setTimeout(() => {
                attackerArm.removeChild(projectile);
                attackerArm.removeChild(flash);
            }, 200);
        }, i * 100);
    }
    
    setTimeout(() => {
        defender.classList.add('hit');
        updateHealth(fighter === 'attacker' ? 'defender' : 'attacker', 30);
    }, 250);
    
    setTimeout(() => {
        defender.classList.remove('hit');
        disableAllButtons(false);
    }, 500);
    
    // Start cooldown
    if (fighter === 'attacker') {
        attackerCooldown = COOLDOWN_TIME;
        document.getElementById('attackerSpecial').disabled = true;
        updateCooldownDisplay('attacker');
    } else {
        defenderCooldown = COOLDOWN_TIME;
        document.getElementById('defenderSpecial').disabled = true;
        updateCooldownDisplay('defender');
    }
}

function updateHealth(fighter, damage) {
    // Check if robot is jumping (immune to damage)
    if ((fighter === 'attacker' && attackerJumping) || 
        (fighter === 'defender' && defenderJumping)) {
        return; // No damage if jumping
    }

    if (fighter === 'attacker') {
        attackerHealth = Math.max(0, attackerHealth - damage);
        const healthBar = document.querySelector('.attacker-health .health-fill');
        const healthText = document.querySelector('.attacker-health .health-text');
        healthBar.style.width = attackerHealth + '%';
        healthText.textContent = attackerHealth + '%';
    } else {
        defenderHealth = Math.max(0, defenderHealth - damage);
        const healthBar = document.querySelector('.defender-health .health-fill');
        const healthText = document.querySelector('.defender-health .health-text');
        healthBar.style.width = defenderHealth + '%';
        healthText.textContent = defenderHealth + '%';
    }

    // Check for game over
    if (attackerHealth <= 0 || defenderHealth <= 0) {
        const winner = attackerHealth <= 0 ? 'Left' : 'Right';
        setTimeout(() => {
            showWinPopup(winner);
        }, 500);
    }
}

function showWinPopup(winner) {
    const popup = document.getElementById('winPopup');
    const winnerText = document.getElementById('winnerText');
    
    // Calculate damage and determine emoji
    const damage = 100 - (winner === 'Left' ? attackerHealth : defenderHealth);
    let emoji = '🏆';
    if (damage >= 90) emoji = '💥';
    else if (damage >= 70) emoji = '⚡';
    else if (damage >= 50) emoji = '🔥';
    
    // Set winner text with enhanced styling
    winnerText.innerHTML = `
        ${emoji} ${winner} ROBOT WINS! ${emoji}
        <span class="damage-text">
            Total damage dealt: ${damage}%
        </span>
    `;
    
    // Show popup
    popup.style.display = 'flex';
    
    // Add event listeners
    document.getElementById('playAgainBtn').onclick = () => {
        hideWinPopup();
        resetGame();
    };
}

function hideWinPopup() {
    const popup = document.getElementById('winPopup');
    popup.style.display = 'none';
}

function resetGame() {
    hideWinPopup();
    attackerHealth = 100;
    defenderHealth = 100;
    
    // Reset health bars
    document.querySelectorAll('.health-fill').forEach(bar => {
        bar.style.width = '100%';
    });
    document.querySelectorAll('.health-text').forEach(text => {
        text.textContent = '100%';
    });

    // Reset cooldowns
    attackerCooldown = 0;
    defenderCooldown = 0;
    updateCooldownDisplay('attacker');
    updateCooldownDisplay('defender');
}

function updateCooldownDisplay(fighter) {
    const cooldown = fighter === 'attacker' ? attackerCooldown : defenderCooldown;
    const element = document.getElementById(`${fighter}Cooldown`);
    
    if (cooldown <= 0) {
        element.textContent = '';
        document.getElementById(`${fighter}Special`).disabled = false;
        return;
    }

    element.textContent = `Cooldown: ${cooldown}s`;
    setTimeout(() => {
        if (fighter === 'attacker') attackerCooldown--;
        else defenderCooldown--;
        updateCooldownDisplay(fighter);
    }, 1000);
}

function disableAllButtons(disabled) {
    document.getElementById('attackerButton').disabled = disabled;
    document.getElementById('defenderButton').disabled = disabled;
    document.getElementById('attackerSpecial').disabled = disabled || attackerCooldown > 0;
    document.getElementById('defenderSpecial').disabled = disabled || defenderCooldown > 0;
}

// Add jump function
function jump(fighter) {
    const robot = document.querySelector('.' + fighter);
    
    // Don't allow jumping if already jumping
    if (fighter === 'defender' && defenderJumping) return;
    if (fighter === 'attacker' && attackerJumping) return;
    
    // Set jumping state
    if (fighter === 'defender') {
        defenderJumping = true;
    } else {
        attackerJumping = true;
    }
    
    // Add jump animation
    robot.classList.add('jumping');
    
    // Remove animation and reset state after completion
    setTimeout(() => {
        robot.classList.remove('jumping');
        if (fighter === 'defender') {
            defenderJumping = false;
        } else {
            attackerJumping = false;
        }
    }, 500); // Match animation duration
}
