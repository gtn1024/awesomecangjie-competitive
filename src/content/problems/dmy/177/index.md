---
oj: dmy
pid: '177'
title: '[R29D]平滑数'
difficulty: 提高
tags:
  - 贪心
  - 构造
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq n \leq 2 \times 10^5$，$1 \leq m \leq n$，$0 \leq b_i \leq 9$，给出的 $a_i$ 互不相同。

## 思路

题目要求构造最小的 $n$ 位平滑数（任意相邻数位之差不超过 $1$），并满足若干位置上的数字被预先固定。直接从高位到低位贪心选「能取的最小数字」会踩坑：例如样例 1，固定第 2 位为 4、第 5 位为 2，若第 1 位贪心取 $1$，则 $|1-4|=3>1$ 立刻无解；正确答案是 $34322$，第 1 位必须取 $3$。所以第 1 位（以及中间任意自由位）的选择都要**往右看**，确保后面那个被固定的位置仍可到达。

预处理 `nxt[i]`：从位置 $i$ 起（含 $i$）向右第一个被固定的位置，没有则为 $-1$。于是自由位的选择多了一条**下界约束**：若 $i$ 之后存在固定位置 $p$（取值 $v$），由于平滑数每位相邻差至多 $1$，从 $i$ 到 $p$ 共 $p-i$ 步，每步最多上涨 $1$，所以 $d_i \geq v - (p-i)$，截断到 $0$。

这样每位 $i$ 的取值同时受到：

- **平滑约束**（与前一位 $d_{i-1}$ 差至多 $1$）：自由位取值范围是 $[d_{i-1}-1, d_{i-1}+1]$；
- **首位非零**（$n>1$ 时 $d_1 \geq 1$）；
- **固定值**（若有）；
- **未来下界** $L = v - (p-i)$。

贪心策略：每位选满足上述所有条件的**最小**可行值。具体分两种情形：

- 若第 $i$ 位被固定为 $x$：检查 $x$ 与前一位差是否 $\leq 1$、（首位时）是否非零、以及 $x \geq L$；任一不满足即整体无解。否则填入 $x$。
- 若第 $i$ 位自由：取 $\mathrm{lo} = \max(L,\ d_{i-1}-1)$，首位时再与 $1$ 取最大、再与 $0$ 取最大。若 $\mathrm{lo} > d_{i-1}+1$（无法兼顾「与前一位平滑」与「给未来留余地」）或 $\mathrm{lo} > 9$ 则无解，否则填入 $\mathrm{lo}$。

为什么这样贪心是对的？因为所有约束要么是局部的（相邻差 $\leq 1$、首位非零），要么来自右侧某个固定位置且已通过 $L$ 折算为「当前位的下界」。当前位取得越小，留给「后续自由位也要尽量小」的余地越大，同时下界 $L$ 已经保证固定位置可达——所以「取最小可行」既最优又不失可行性。

样例 2 中固定 $d_2 = 1$、$d_5 = 5$：首位下界 $L = 5 - 4 = 1$，但平滑要求 $d_1 \geq d_2 - 1 = 0$，取 $\mathrm{lo}=1$ 后 $d_2=1$，向右每步最多涨 $1$，第 5 位最多到 $4 < 5$，无解；输出 `-1`。

## 复杂度

预处理 `nxt` 与逐位构造各 $O(n)$，总时间 $O(n+m)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func solve(reader: ConsoleReader) {
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = header[0]
    let m = header[1]
    let nn = n

    // fix[i]：第 i 位（从左数 1-based）的固定数字，-1 表示无限制
    let fix = Array<Int64>(nn, { _ => -1 })
    var k = 0
    while (k < m) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = line[0] - 1 // 转 0-based 下标
        fix[a] = line[1]
        k = k + 1
    }

    // nxt[i]：i 及之后第一个 fix 位置，没有则为 -1
    let nxt = Array<Int64>(nn, { _ => -1 })
    var last: Int64 = -1
    var j = nn - 1
    while (j >= 0) {
        if (fix[j] != -1) {
            last = j
        }
        nxt[j] = last
        j = j - 1
    }

    var ok = true
    let ans = Array<Int64>(nn, { _ => 0 })
    var i = 0
    while (i < nn && ok) {
        var prev: Int64
        if (i == 0) {
            prev = -1 // 第一位没有前驱，下界为 0；后续会用 1 约束最高位
        } else {
            prev = ans[i - 1]
        }

        // 未来约束带来的下界 L：必须能让某 fix 位置取到目标值。
        // 平滑约束下，从 i 到 fixPos 距离 dis，d[i] 至少为 fixVal - dis。
        var L: Int64
        if (nxt[i] == -1) {
            L = 0
        } else {
            let fixPos = nxt[i]
            let dis = fixPos - i
            L = fix[fixPos] - dis
            if (L < 0) {
                L = 0
            }
        }

        if (fix[i] != -1) {
            var d = fix[i]
            if (i == 0) {
                if (nn > 1 && d == 0) {
                    ok = false
                }
            } else {
                let diff = d - prev
                if (diff < 0) {
                    // d < prev
                    if (prev - d > 1) {
                        ok = false
                    }
                } else if (diff > 1) {
                    ok = false
                }
            }
            // 是否可能为未来留余地？fix 固定，无法调整
            if (d < L) {
                ok = false // 给未来定的下界都达不到
            }
            ans[i] = d
        } else {
            // 选最小可行：需 >= L，且（i>=1 时）需 >= prev-1 且 <= prev+1，首位需 >= 1
            var lo = L
            if (i == 0) {
                if (nn > 1) {
                    if (lo < 1) {
                        lo = 1
                    }
                } else {
                    if (lo < 0) {
                        lo = 0
                    }
                }
            } else {
                if (lo < prev - 1) {
                    lo = prev - 1
                }
                if (lo < 0) {
                    lo = 0
                }
                if (lo > prev + 1) {
                    // 无法同时满足「跟前一位差<=1」和「给未来留余地」
                    ok = false
                }
            }
            if (ok) {
                if (lo > 9) {
                    ok = false
                } else {
                    ans[i] = lo
                }
            }
        }
        i = i + 1
    }

    if (!ok) {
        println("-1")
        return
    }

    var idx = 0
    while (idx < nn) {
        print(ans[idx])
        idx = idx + 1
    }
    println()
}

main() {
    let reader = getStdIn()
    solve(reader)
}
```

</details>
