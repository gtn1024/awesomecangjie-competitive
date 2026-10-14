---
oj: dmy
pid: '507'
title: 踏步机器人
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 100$，$1 \le A_i \le 100$，$1 \le X \le 10^5$，$0 \le M \le 100$，$1 \le B_i < X$，所有坏位置互不相同。

## 思路

机器人只能向前跳、且必须恰好落在 $X$ 上，所以问题只关心「哪些位置可以被恰好跳到」，跳的过程本身没有代价、也没有次数限制，**位置的可达性与用什么顺序跳过来无关**。

设 $reach[p]$ 表示「能否恰好落在位置 $p$」：

$$reach[p] = \bigvee_{a \in A,\ a \le p} reach[p - a]$$

即只要存在一种跳距 $a$，使得 $p - a$ 可达且 $p - a$ 是合法的落脚点，$p$ 就可达。初始 $reach[0] = true$，因为位置 $0$ 是起点。由于所有 $A_i \ge 1$，每个状态只依赖下标严格更小的状态，按 $p$ 从小到大递推即可。

坏位置的处理：坏位置本身不允许落脚，因此**不参与转移的候选**，直接令 $reach[p] = false$；但机器人只是不能停在上面，从上方「越过」一个坏位置完全合法（样例中从 $3$ 直接跳到 $8$ 就越过了坏位置 $6$）。又因为 $B_i \ge 1$，起点 $0$ 一定不是坏位置。

最后输出 $reach[X]$ 对应的 `Yes` / `No`。

另外注意输入格式：$M = 0$ 时描述里说「不存在需要避开的坏位置」，第五行可能整行缺失，所以要先读 $M$，再按 $M > 0$ 决定是否读入第五行。

## 复杂度

时间 $O(N \cdot X)$，额外空间 $O(X)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    reader.readln().getOrThrow()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let x = Int64.parse(reader.readln().getOrThrow())
    let m = Int64.parse(reader.readln().getOrThrow())
    let size = x + 1
    let good = Array<Bool>(size, { _ => true })
    if (m > 0) {
        let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        for (v in b) {
            good[v] = false
        }
    }
    let reach = Array<Bool>(size, { _ => false })
    reach[0] = true
    var pos: Int64 = 1
    while (pos <= x) {
        if (good[pos]) {
            for (v in a) {
                if (v <= pos && reach[pos - v]) {
                    reach[pos] = true
                }
            }
        }
        pos += 1
    }
    if (reach[x]) {
        println("Yes")
    } else {
        println("No")
    }
}
```

</details>
