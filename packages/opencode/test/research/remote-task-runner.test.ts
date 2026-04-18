import { describe, expect, test } from "bun:test"
import { session, wrapRemoteScript } from "../../src/research/remote-task-runner"

describe("research.remote-task-runner", () => {
  test("wraps direct ssh script as heredoc command", () => {
    const cmd = wrapRemoteScript(
      {
        mode: "direct",
        address: "connect.cqa1.seetacloud.com",
        port: 38734,
        user: "root",
        password: "HX5a6bU9/hUP",
      },
      [
        "mkdir -p /mnt/zhouzih",
        "screen -dmS cub_download bash -lc 'echo START $(date) >> /mnt/zhouzih/cub_download.log'",
      ].join("\n"),
    )

    expect(cmd)
      .toBe(`sshpass -p 'HX5a6bU9/hUP' ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR -p 38734 'root@connect.cqa1.seetacloud.com' <<'EOF'
mkdir -p /mnt/zhouzih
screen -dmS cub_download bash -lc 'echo START $(date) >> /mnt/zhouzih/cub_download.log'
EOF`)
  })

  test("uses a unique heredoc marker when script contains EOF", () => {
    const cmd = wrapRemoteScript(
      {
        mode: "ssh_config",
        host_alias: "gpu-box",
      },
      "echo EOF\necho done",
    )

    expect(cmd).toContain("<<'EOF_OPENCODE'")
    expect(cmd.endsWith("EOF_OPENCODE")).toBeTrue()
  })

  test("generates short unique screen session names", () => {
    const a = session("exp-1")
    const b = session("exp-1")
    expect(a.length).toBeLessThanOrEqual(64)
    expect(b.length).toBeLessThanOrEqual(64)
    expect(a.startsWith("openresearch-")).toBeTrue()
    expect(b.startsWith("openresearch-")).toBeTrue()
    expect(a).not.toBe(b)
    expect(a).toMatch(/^openresearch-\d{13}-[a-f0-9]{6}$/)
    expect(b).toMatch(/^openresearch-\d{13}-[a-f0-9]{6}$/)
  })
})
