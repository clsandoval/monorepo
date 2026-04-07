use irontide_core::{GameState, PlayerCommand, TurnCommands};

/// Run two identical simulations with the same seed and commands.
/// Verify they produce identical checksums at every tick.
#[test]
fn test_full_determinism() {
    let seed = 42u64;
    let map_seed = 100u64;

    let mut state_a = GameState::new(seed, map_seed, 2);
    let mut state_b = GameState::new(seed, map_seed, 2);

    // Verify initial state matches
    assert_eq!(state_a.checksum(), state_b.checksum(), "Initial state mismatch");

    // Run 100 ticks with no commands
    for t in 0..100 {
        state_a.tick(&[]);
        state_b.tick(&[]);
        assert_eq!(
            state_a.checksum(),
            state_b.checksum(),
            "Desync at tick {} (no commands)",
            t
        );
    }

    // Run 100 ticks with move commands
    for t in 100..200 {
        let cmds = vec![
            TurnCommands {
                tick: t,
                player_id: 0,
                commands: vec![PlayerCommand::Move {
                    unit_ids: vec![0, 1, 2],
                    target_x: 50 + (t as i32 % 20),
                    target_y: 50 + (t as i32 % 20),
                }],
                checksum: None,
            },
            TurnCommands {
                tick: t,
                player_id: 1,
                commands: vec![PlayerCommand::Move {
                    unit_ids: vec![5, 6, 7],
                    target_x: 200 - (t as i32 % 20),
                    target_y: 200 - (t as i32 % 20),
                }],
                checksum: None,
            },
        ];

        state_a.tick(&cmds);
        state_b.tick(&cmds);
        assert_eq!(
            state_a.checksum(),
            state_b.checksum(),
            "Desync at tick {} (with commands)",
            t
        );
    }

    // Verify unit counts match
    assert_eq!(state_a.unit_count(), state_b.unit_count());
}

/// Verify that different commands produce different states.
#[test]
fn test_different_commands_diverge() {
    let mut state_a = GameState::new(42, 100, 2);
    let mut state_b = GameState::new(42, 100, 2);

    // Same initial state
    assert_eq!(state_a.checksum(), state_b.checksum());

    // Give different move commands
    let cmds_a = vec![TurnCommands {
        tick: 0,
        player_id: 0,
        commands: vec![PlayerCommand::Move {
            unit_ids: vec![0],
            target_x: 50,
            target_y: 50,
        }],
        checksum: None,
    }];
    let cmds_b = vec![TurnCommands {
        tick: 0,
        player_id: 0,
        commands: vec![PlayerCommand::Move {
            unit_ids: vec![0],
            target_x: 100,
            target_y: 100,
        }],
        checksum: None,
    }];

    for _ in 0..30 {
        state_a.tick(&cmds_a);
        state_b.tick(&cmds_b);
    }

    assert_ne!(state_a.checksum(), state_b.checksum());
}
