---
oj: dmy
pid: '454'
title: '[R73D] 计数器'
difficulty: 提高
tags:
  - 构造
  - 数学
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$T \le 10^4$，$n \le 2 \times 10^5$，所有测试数据中 $n$ 的总和不超过 $2 \times 10^5$；$a_i, b_i \le 10^9$。

## 思路

一次操作把某个最小值 $m$ 改为 $m + M$（$M$ 为当前最大值）。操作后 $m + M > M$，因此**每次操作都会产生一个严格唯一的新的最大值**：它就是本次被操作的那个计数器。

反过来说，若当前状态的最大值 $B$ 唯一，那么最后一次操作必作用于持有 $B$ 的计数器。设操作前最大值为 $M$，则操作前该计数器的值为 $B - M$；而操作后除它以外的元素都保持不变，所以 $M$ 恰等于**操作后状态的次大值** $S$。逆推一步的规则就是：

- 若最大值不唯一，则无解（零次操作的情况已单独处理）；
- 记次大值为 $S$、其余元素的最小值为 $mn$，令 $d = B - S$。只有当 $d \le mn$ 时，操作前 $d$ 才可能是一个最小值，才能逆推：把该元素改为 $d$；
- 否则无解。

逆推的过程中，每一步的合法变换都是**唯一确定**的，因此只需从 $b$ 一路逆推，检查每个中间状态是否等于 $a$（等于时步数即答案），直到无法继续（最大值不唯一或 $d > mn$）就输出 $-1$。

还没完：逆推的合法路径可以很长。把数组排序后观察，逆推一步等价于：弹出最大值 $B$，若 $d = B - S \le$ 当前最小值，把 $d$ 插回队首，其余元素的相对顺序不变（排序序仍保持）。所以用**环形缓冲维护排序后的值 + 编号**，每步 $O(1)$。

最坏步数：构造上界时，值的递推形如 $x_t = x_{t-1} + x_{t-n}$（$n$ 为元素个数），特征根 $\rho$ 满足 $\rho^n = \rho^{n-1} + 1$，故最坏步数约为 $\ln(10^9) / \ln \rho$，$n = 2 \times 10^5$ 时约为 $4 \times 10^5$，总步数在可接受范围内。

判等：维护与目标 $a$ 的**逐位差异个数** `diff`（初始为 $a_i \ne b_i$ 的位置数）。每次逆推只改一个位置，按新旧值与该位目标值的关系 $O(1)$ 更新 `diff`；`diff = 0` 即当前状态等于 $a$，无需每次全数组比较。

## 复杂度

时间 $O(n \log n + L)$，其中 $L$ 为逆推步数（最坏约 $4 \times 10^5$）；空间 $O(n + L)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

// 逆推：每次把唯一最大值 p 改为 p - 次大值，
// 合法当且仅当 p - 次大值 <= 其余元素的最小值。
// 排序后数组上，这一步等价于：弹出最大、把 p - 次大 插回队首，
// 其余元素相对顺序不变，环形缓冲 O(1) 每步。
func solve(reader: ConsoleReader): Unit {
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({
        p: String => Int64.parse(p)
    })
    var cur = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({
        p: String => Int64.parse(p)
    })
    // 与目标 a 逐位不同的位置个数，为 0 即相等
    var diff: Int64 = 0
    var i: Int64 = 0
    while (i < nn) {
        if (a[i] != cur[i]) {
            diff += 1
        }
        i += 1
    }
    // 按值排序并保留编号：val * BASE + idx
    let BASE: Int64 = 2097152
    let keys = Array<Int64>(nn, { _ => 0 })
    i = 0
    while (i < nn) {
        keys[i] = cur[i] * BASE + i
        i += 1
    }
    sort(keys)
    // 环形缓冲：队首在 head，队尾在 tail-1；前插 head--，后弹 tail--
    let SLACK = 26 * nn + 64
    let vals = Array<Int64>(nn + SLACK, { _ => 0 })
    let ids = Array<Int64>(nn + SLACK, { _ => 0 })
    var head = SLACK
    var tail = SLACK + nn
    i = 0
    while (i < nn) {
        let k = keys[i]
        vals[SLACK + i] = k / BASE
        ids[SLACK + i] = k % BASE
        i += 1
    }
    var cnt: Int64 = 0
    while (true) {
        if (diff == 0) {
            println(cnt)
            return
        }
        // 弹出当前最大值
        tail -= 1
        let p = vals[tail]
        let pidx = ids[tail]
        // 最大值不唯一则无法继续逆推
        if (vals[tail - 1] == p) {
            println("-1")
            return
        }
        let sec = vals[tail - 1]
        let d = p - sec
        // p - 次大 必须不超过其余元素的最小值（队首）
        if (d > vals[head]) {
            println("-1")
            return
        }
        if (a[pidx] == p && a[pidx] != d) {
            diff += 1
        } else if (a[pidx] != p && a[pidx] == d) {
            diff -= 1
        }
        head -= 1
        vals[head] = d
        ids[head] = pidx
        cnt += 1
    }
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var k: Int64 = 0
    while (k < t) {
        solve(reader)
        k += 1
    }
}
```