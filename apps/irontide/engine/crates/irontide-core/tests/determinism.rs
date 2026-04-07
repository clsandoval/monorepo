use irontide_core::{GameState, PlayerCommand, TurnCommands};
use irontide_core::components::{BuildingType, UnitType};

/// Run two identical GameState instances through the same sequence of commands
/// and verify checksums match at every stage, exercising all major game systems.
#[test]
fn test_full_game_determinism() {
    let mut state_a = GameState::new(42, 100, 2);
    let mut state_b = GameState::new(42, 100, 2);

    // Verify initial state matches
    assert_eq!(state_a.checksum(), state_b.checksum(), "Initial state mismatch");

    // --- Phase 1: Idle (100 ticks, no commands) ---
    for t in 0..100u32 {
        state_a.tick(&[]);
        state_b.tick(&[]);
        assert_eq!(
            state_a.checksum(),
            state_b.checksum(),
            "Phase 1 desync at tick {} (idle)",
            t
        );
    }
    println!("Phase 1 (idle 100 ticks): checksum = {}", state_a.checksum());

    // --- Phase 2: Move commands (100 ticks, move units 0 and 1 to 50,50) ---
    // Find worker entities for player 0
    let workers_p0 = state_a.get_units_by_type(0, UnitType::Worker);
    assert!(!workers_p0.is_empty(), "Player 0 should have workers");
    let worker_0 = workers_p0[0];
    let worker_1 = if workers_p0.len() > 1 { workers_p0[1] } else { workers_p0[0] };

    for t in 100..200u32 {
        let cmds = vec![TurnCommands {
            tick: t,
            player_id: 0,
            commands: vec![PlayerCommand::Move {
                unit_ids: vec![worker_0, worker_1],
                target_x: 50,
                target_y: 50,
            }],
            checksum: None,
        }];

        state_a.tick(&cmds);
        state_b.tick(&cmds);
        assert_eq!(
            state_a.checksum(),
            state_b.checksum(),
            "Phase 2 desync at tick {} (move commands)",
            t
        );
    }
    println!("Phase 2 (move 100 ticks): checksum = {}", state_a.checksum());

    // --- Phase 3: Build command (build barracks at 20,20 from worker_0, then 200 idle ticks) ---
    // Issue a single build command on tick 200
    let build_cmds = vec![TurnCommands {
        tick: 200,
        player_id: 0,
        commands: vec![PlayerCommand::Build {
            builder: worker_0,
            building_type: BuildingType::Barracks,
            x: 20,
            y: 20,
        }],
        checksum: None,
    }];
    state_a.tick(&build_cmds);
    state_b.tick(&build_cmds);
    assert_eq!(
        state_a.checksum(),
        state_b.checksum(),
        "Phase 3 desync at tick 200 (build command)"
    );

    // 200 idle ticks to let construction proceed
    for t in 201..401u32 {
        state_a.tick(&[]);
        state_b.tick(&[]);
        assert_eq!(
            state_a.checksum(),
            state_b.checksum(),
            "Phase 3 desync at tick {} (post-build idle)",
            t
        );
    }
    println!("Phase 3 (build + 200 idle ticks): checksum = {}", state_a.checksum());

    // --- Phase 4: Train command (find barracks, queue a Rifleman, then 200 idle ticks) ---
    // The barracks might not exist if the worker didn't have enough resources — handle gracefully
    let barracks_list = state_a.get_buildings_by_type(0, BuildingType::Barracks);
    if !barracks_list.is_empty() {
        let barracks_entity = barracks_list[0];

        // Only issue train command if barracks is fully built (progress == 1.0)
        let progress = state_a.get_building_progress(barracks_entity);
        if progress >= 1.0 {
            let train_cmds = vec![TurnCommands {
                tick: 401,
                player_id: 0,
                commands: vec![PlayerCommand::Train {
                    building: barracks_entity,
                    unit_type: UnitType::Rifleman,
                }],
                checksum: None,
            }];
            state_a.tick(&train_cmds);
            state_b.tick(&train_cmds);
            assert_eq!(
                state_a.checksum(),
                state_b.checksum(),
                "Phase 4 desync at tick 401 (train command)"
            );
            println!("Phase 4: Issued train command for Rifleman from barracks entity {}", barracks_entity);
        } else {
            println!("Phase 4: Barracks exists but not complete (progress={:.2}), ticking once idle", progress);
            state_a.tick(&[]);
            state_b.tick(&[]);
            assert_eq!(
                state_a.checksum(),
                state_b.checksum(),
                "Phase 4 desync at tick 401 (barracks not ready, idle)"
            );
        }

        // 200 idle ticks to let production run
        for t in 402..602u32 {
            state_a.tick(&[]);
            state_b.tick(&[]);
            assert_eq!(
                state_a.checksum(),
                state_b.checksum(),
                "Phase 4 desync at tick {} (post-train idle)",
                t
            );
        }
        println!("Phase 4 (train + 200 idle ticks): checksum = {}", state_a.checksum());
    } else {
        println!("Phase 4: No barracks found (skipping train phase), ticking 201 idle ticks");
        for t in 401..602u32 {
            state_a.tick(&[]);
            state_b.tick(&[]);
            assert_eq!(
                state_a.checksum(),
                state_b.checksum(),
                "Phase 4 desync at tick {} (no barracks, idle)",
                t
            );
        }
    }

    // --- Final assertions ---
    assert_eq!(
        state_a.checksum(),
        state_b.checksum(),
        "Final checksum mismatch"
    );
    assert_eq!(
        state_a.player_resources,
        state_b.player_resources,
        "Final player_resources mismatch"
    );
    assert_eq!(
        state_a.tick,
        state_b.tick,
        "Final tick count mismatch"
    );

    println!(
        "test_full_game_determinism PASSED: tick={}, checksum={}, resources={:?}",
        state_a.tick,
        state_a.checksum(),
        state_a.player_resources
    );
}

/// Verify that two GameState instances with the same seeds but different commands
/// diverge: their checksums should differ after 50 ticks.
#[test]
fn test_divergence_detected() {
    let mut state_a = GameState::new(42, 100, 2);
    let mut state_b = GameState::new(42, 100, 2);

    // Both start identical
    assert_eq!(state_a.checksum(), state_b.checksum(), "Initial state should match");

    // Find worker entity for player 0 (should exist in both states with same ID)
    let workers = state_a.get_units_by_type(0, UnitType::Worker);
    assert!(!workers.is_empty(), "Player 0 should have workers");
    let worker = workers[0];

    // state_a moves to (10, 10), state_b moves to (200, 200) — completely different directions
    let cmds_a = vec![TurnCommands {
        tick: 0,
        player_id: 0,
        commands: vec![PlayerCommand::Move {
            unit_ids: vec![worker],
            target_x: 10,
            target_y: 10,
        }],
        checksum: None,
    }];
    let cmds_b = vec![TurnCommands {
        tick: 0,
        player_id: 0,
        commands: vec![PlayerCommand::Move {
            unit_ids: vec![worker],
            target_x: 200,
            target_y: 200,
        }],
        checksum: None,
    }];

    for _ in 0..50 {
        state_a.tick(&cmds_a);
        state_b.tick(&cmds_b);
    }

    assert_ne!(
        state_a.checksum(),
        state_b.checksum(),
        "States should diverge when given different commands"
    );

    println!(
        "test_divergence_detected PASSED: checksum_a={}, checksum_b={}",
        state_a.checksum(),
        state_b.checksum()
    );
}
