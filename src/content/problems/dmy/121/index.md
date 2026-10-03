---
oj: dmy
pid: '121'
title: '[R20G]统计好数'
difficulty: 提高+/省选-
tags:
  - 数位DP
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

## 题目

称一个整数 $x$ 是好数，当且仅当 $x$ 的数位中，出现次数最多的数字的出现次数 $f_{\max}$ 与出现次数最少的数字（仅统计出现过的数字）的出现次数 $f_{\min}$ 满足 $f_{\max}-f_{\min}\le k$。给定 $T$ 组询问 $l,r,k$，求区间 $[l,r]$ 内好数的个数。

> 对于 $100\%$ 的数据，$1\le T\le 10$，$1\le l\le r\le 10^{18}$，$1\le k\le 18$。

## 思路

**答案差分**：答案为 $f(r)-f(l-1)$，其中 $f(n)$ 统计 $[1,n]$ 内好数的个数，用数位 DP 计算。

**直方图状态**：一个数最多有 $19$ 个数位，每个数字 $0\sim 9$ 的出现次数由这些数位唯一确定；而「好坏」只取决于这些出现次数的多重集合，即直方图 $h[c]$——出现次数恰为 $c$ 的数字个数（$c=0..19$）。关键观察是：前缀的**未来**也完全由直方图决定。接下来填一个当前出现次数为 $c$ 的数字，有 $h[c]$ 种选择，且无论选的是哪一个数字，新直方图都一样（$h[c]-1$，$h[c+1]+1$）。因此 10 个数字完全对称，DP 状态可以压缩成直方图，而不是 10 元组计数向量。

**转移**：设 $dp(rem,h,started)$ 为还剩 $rem$ 位任选、当前前缀直方图为 $h$ 时的方案数，$started$ 表示是否已填过非零数位（前导零不计入数字）。未开始时填 $0$ 保持未开始（1 种选择），填 $1..9$ 则数字开始（9 种选择）；开始时填一个出现次数为 $c$ 的数字有 $h[c]$ 种选择。$rem=0$ 时，根据 $h$ 中 $c\ge 1$ 的最大值与最小值之差是否不超过 $k$ 返回 1 或 0。

**数位分解**：贴着 $n$ 的前缀走一遍，显式维护每个数字的出现次数；每到一位，把「填更小的数字、之后各位自由」的分支交给带记忆化的自由 DP，最后把 $n$ 本身统计上。注意记忆化键必须包含剩余位数 $rem$：未开始状态的前导零不改变直方图，同一个直方图会对应不同的 $rem$。

状态总数约为把 $0..19$ 分成至多 10 部分的所有分拆数之和（约两千个），单组询问只需数万次操作。

## 复杂度

- 时间复杂度：每个状态至多 20 种转移，状态总数为分拆数之和 $O(\sum p(i))$，单组询问约 $10^4$ 量级的操作。
- 空间复杂度：$O(\sum p(i))$，即记忆化的直方图状态数。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

class Solver {
    var k: Int64
    var memo: HashMap<String, Int64>

    init(k: Int64) {
        this.k = k
        this.memo = HashMap<String, Int64>()
    }

    // h[c]：出现次数恰好为 c 的数字个数（c = 0..19），h[0] 为尚未出现的数字个数
    func goodHist(h: Array<Int64>): Int64 {
        var mx: Int64 = 0
        var mn: Int64 = 100
        var c: Int64 = 1
        while (c <= 19) {
            if (h[c] > 0) {
                if (c > mx) { mx = c }
                if (c < mn) { mn = c }
            }
            c = c + 1
        }
        if (mx - mn <= this.k) { return 1 }
        return 0
    }

    func encode(rem: Int64, h: Array<Int64>): String {
        let sb = StringBuilder()
        sb.append(rem)
        sb.append('|')
        var c: Int64 = 0
        while (c <= 19) {
            sb.append(h[c])
            sb.append(',')
            c = c + 1
        }
        return sb.toString()
    }

    // 自由位 DP：还剩 rem 位任选，h 为当前出现次数直方图，started 表示数字是否已开始
    func dp(rem: Int64, h: Array<Int64>, started: Int64): Int64 {
        if (rem == 0) {
            if (started == 0) { return 0 }
            return this.goodHist(h)
        }
        match (this.memo.get(this.encode(rem, h))) {
            case Some(v) => return v
            case None => ()
        }
        var total: Int64 = 0
        if (started == 0) {
            // 这一位填 0：仍是前导零
            total += this.dp(rem - 1, h, 0)
            // 这一位填 1..9：数字开始，有 9 种选择
            h[0] -= 1
            h[1] += 1
            total += 9 * this.dp(rem - 1, h, 1)
            h[1] -= 1
            h[0] += 1
        } else {
            // 选一个出现次数为 c 的数字，共 h[c] 种选择
            var c: Int64 = 0
            while (c <= 18) {
                if (h[c] > 0) {
                    let cnt = h[c]
                    h[c] = cnt - 1
                    h[c + 1] = h[c + 1] + 1
                    total += cnt * this.dp(rem - 1, h, 1)
                    h[c + 1] = h[c + 1] - 1
                    h[c] = cnt
                }
                c = c + 1
            }
        }
        this.memo.add(this.encode(rem, h), total)
        return total
    }

    func histOf(cntv: Array<Int64>): Array<Int64> {
        let h = Array<Int64>(20, { _ => 0 })
        var e: Int64 = 0
        while (e < 10) {
            h[cntv[e]] = h[cntv[e]] + 1
            e = e + 1
        }
        return h
    }

    // 统计 [1, n] 中好数的个数
    func calc(n: Int64): Int64 {
        if (n <= 0) { return 0 }
        // 拆分数位
        var x = n
        var cnt: Int64 = 0
        var y = n
        while (y > 0) {
            cnt += 1
            y = y / 10
        }
        let L = cnt
        let ds = Array<Int64>(L, { _ => 0 })
        x = n
        var i = L - 1
        while (i >= 0) {
            ds[i] = x % 10
            x = x / 10
            i = i - 1
        }
        this.memo = HashMap<String, Int64>()
        let cntv = Array<Int64>(10, { _ => 0 })
        var started: Int64 = 0
        var total: Int64 = 0
        var pos: Int64 = 0
        while (pos < L) {
            let nd = ds[pos]
            var d: Int64 = 0
            while (d < nd) {
                // 这一位填 d，之后各位自由
                var st2 = started
                let cntv2 = Array<Int64>(10, { i: Int64 => cntv[i] })
                if (st2 == 0 && d == 0) {
                    // 前导零，数字仍未开始
                } else if (st2 == 0) {
                    cntv2[d] = 1
                    st2 = 1
                } else {
                    cntv2[d] = cntv2[d] + 1
                }
                total += this.dp(L - pos - 1, this.histOf(cntv2), st2)
                d = d + 1
            }
            // 这一位继续贴住 n 的前缀
            let d2 = nd
            if (started == 0) {
                cntv[d2] = 1
                started = 1
            } else {
                cntv[d2] = cntv[d2] + 1
            }
            pos = pos + 1
        }
        // n 本身
        total += this.goodHist(this.histOf(cntv))
        return total
    }
}

func solve(reader: ConsoleReader): Unit {
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let l = parts[0]
    let r = parts[1]
    let k = parts[2]
    let solver = Solver(k)
    let ans = solver.calc(r) - solver.calc(l - 1)
    println(ans)
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var i: Int64 = 0
    while (i < t) {
        solve(reader)
        i += 1
    }
}
```

</details>
