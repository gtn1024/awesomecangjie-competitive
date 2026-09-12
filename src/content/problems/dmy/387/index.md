---
oj: dmy
pid: '387'
title: '[R62C] 机器人巡逻'
difficulty: 普及
tags:
  - 模拟
  - 差分
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, Q \le 2 \times 10^5$，$1 \le P \le n$，$1 \le x \le n$。

## 思路

只需在最后输出每个格子的印章状态，不必关心中间过程。维护一个数组 $d$，记录每个格子被「翻转」的次数，最终 $d[i]$ 为奇数即有印章（输出 `1`），偶数即无印章（输出 `0`）。

机器人初始位于 $P$、面朝右、工作状态为 $1$。逐个操作模拟其位置、方向、状态：

- 操作 `1 x`：沿当前方向最多走 $x$ 步，实际能走的步数受边界限制。面朝右时最多走 $n-\mathit{pos}$ 步，面朝左时最多走 $\mathit{pos}-1$ 步。注意 **翻转的是新到达的格子**，即 $\mathit{pos}+1, \mathit{pos}+2, \dots$（向右）或 $\mathit{pos}-1, \mathit{pos}-2, \dots$（向左），起始位置不被翻转。
- 操作 `2`：翻转方向。
- 操作 `3`：切换工作状态（状态 $1$ 翻转、状态 $2$ 只移动不翻转）。

难点在操作 `1` 处于状态 $1$ 时，若暴力逐格 $+1$ 会退化到 $O(nQ)$。观察到一次操作翻转的是一段 **连续区间**：向右走 $k$ 步翻转 $[\mathit{pos}+1,\mathit{pos}+k]$，向左走 $k$ 步翻转 $[\mathit{pos}-k,\mathit{pos}-1]$。区间加一、末尾单点查询是差分数组的经典用法：维护差分数组 $\mathit{diff}$，对区间 $[l,r]$ 加一只需 $\mathit{diff}[l]\mathrel{+}=1$、$\mathit{diff}[r+1]\mathrel{-}=1$，最后做一遍前缀和即得 $d$ 数组。

时间复杂度 $O(n+Q)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line[0]
    let q = line[1]
    var pos = line[2]
    var dir = 1 // 1 = right, -1 = left
    var state = 1 // 1 = toggle, 2 = idle

    // Difference array of size n+2, 1-indexed.
    let nn = n
    var diff = Array<Int64>(nn + 2, { _ => 0 })

    var i = 0
    while (i < q) {
        i += 1
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
        let op = parts[0]
        if (op == 1) {
            let x = parts[1]
            if (state == 1) {
                // Determine actual steps to take.
                var steps = x
                if (dir == 1) {
                    let maxSteps = n - pos
                    if (steps > maxSteps) {
                        steps = maxSteps
                    }
                    if (steps > 0) {
                        // Toggle positions [pos+1, pos+steps].
                        let l = pos + 1
                        let r = pos + steps
                        diff[l] += 1
                        diff[r + 1] -= 1
                        pos = r
                    }
                } else {
                    let maxSteps = pos - 1
                    if (steps > maxSteps) {
                        steps = maxSteps
                    }
                    if (steps > 0) {
                        let l = pos - steps
                        let r = pos - 1
                        diff[l] += 1
                        diff[r + 1] -= 1
                        pos = l
                    }
                }
            } else {
                // state 2: just move, no toggling.
                if (dir == 1) {
                    var steps = x
                    let maxSteps = n - pos
                    if (steps > maxSteps) {
                        steps = maxSteps
                    }
                    pos += steps
                } else {
                    var steps = x
                    let maxSteps = pos - 1
                    if (steps > maxSteps) {
                        steps = maxSteps
                    }
                    pos -= steps
                }
            }
        } else if (op == 2) {
            dir = -dir
        } else {
            // op == 3
            if (state == 1) {
                state = 2
            } else {
                state = 1
            }
        }
    }

    // Prefix sum and output directly.
    var cur = 0
    var j = 1
    while (j <= n) {
        cur += diff[j]
        if ((cur % 2) != 0) {
            print('1')
        } else {
            print('0')
        }
        j += 1
    }
    println()
}
```

## 要点

- **只关心最终状态**：不必逐格维护中间过程，记录每格被翻转的次数，奇偶性即最终状态，把「翻转」抽象成区间加一。
- **边界裁剪步数**：实际步数为 $\min(x,\,n-\mathit{pos})$（向右）或 $\min(x,\,\mathit{pos}-1)$（向左），越过边界立即停止，起始格不在翻转范围内。
- **差分优化**：一次状态 $1$ 的移动翻转的是连续区间 $[l,r]$，用差分数组两端各改一处即可，把单次操作从 $O(n)$ 降到 $O(1)$。
- 状态 $2$ 只移动不翻转，更新 $\mathit{pos}$ 即可，无需动差分数组。
