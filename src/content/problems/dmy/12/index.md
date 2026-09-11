---
oj: dmy
pid: '12'
title: '[R2F] 带修求和'
difficulty: 提高
tags:
  - 树状数组
  - 二分
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 5 \times 10^5$，$1 \le A_i,y \le 5 \times 10^6$，$0 \le v \le 10^{18}$。

## 思路

值域只有 $5 \times 10^6$，用两棵树状数组建在「值」上：`sumBit` 维护每个值的总和贡献，`cntBit` 维护每个值的出现次数。

- **操作 1**：值 $old = A_x$ 的出现次数和贡献各减一，值 $y$ 各加一，更新 $A_x$。
- **操作 2（取大）**：答案形如「取 $[p+1, M]$ 的全部项，再在 $p$ 处取一部分」。令 $q$ 为前缀和 $\le total - v$ 的最大位置，则 $p = q+1$；在 $p$ 处还需要补 $need = v - (total - pref(p))$，该项数为 $\lceil need / p \rceil$。
- **操作 3（取小）**：令 $q$ 为前缀和 $\le v$ 的最大位置，先取 $[1,q]$ 全部，再用剩余额度在值 $q+1$ 处尽量多取。

「前缀和 $\le X$ 的最大位置」用树状数组上的倍增实现，$O(\log M)$ 一次。无解（总和不足）与 $v = 0$ 的情况单独处理。

复杂度：时间 $O((n+q)\log M)$，空间 $O(M)$，$M = 5 \times 10^6$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
const MAXV = 5000000

var sumBit = Array<Int64>(MAXV + 1, { _ => 0 })
var cntBit = Array<Int64>(MAXV + 1, { _ => 0 })

func bitAdd(bit: Array<Int64>, pos: Int64, delta: Int64) {
    var i = pos
    while (i <= MAXV) {
        bit[i] += delta
        i += i & (-i)
    }
}

func bitSum(bit: Array<Int64>, pos: Int64): Int64 {
    var s: Int64 = 0
    var i = pos
    while (i > 0) {
        s += bit[i]
        i -= i & (-i)
    }
    return s
}

// 最大的 pos，使得 sumBit 前缀和 <= x（0 <= pos <= MAXV）
func findPos(x: Int64): Int64 {
    var pos: Int64 = 0
    var acc: Int64 = 0
    var t: Int64 = 4194304
    while (t > 0) {
        let np = pos + t
        if (np <= MAXV && acc + sumBit[np] <= x) {
            pos = np
            acc += sumBit[np]
        }
        t >>= 1
    }
    return pos
}

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    for (i in 0..n) {
        let v = a[i]
        bitAdd(sumBit, v, v)
        bitAdd(cntBit, v, 1)
    }
    let q = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..q) {
        let toks = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let op = Int64.parse(toks[0])
        if (op == 1) {
            let x = Int64.parse(toks[1])
            let y = Int64.parse(toks[2])
            let old = a[x - 1]
            a[x - 1] = y
            bitAdd(sumBit, old, -old)
            bitAdd(sumBit, y, y)
            bitAdd(cntBit, old, -1)
            bitAdd(cntBit, y, 1)
        } else if (op == 2) {
            let v = Int64.parse(toks[1])
            if (v <= 0) {
                println(0)
            } else {
                let total = bitSum(sumBit, MAXV)
                if (total < v) {
                    println(-1)
                } else {
                    let qpos = findPos(total - v)
                    let p = qpos + 1
                    let sumAfterP = total - bitSum(sumBit, p)
                    let cntAfterP = bitSum(cntBit, MAXV) - bitSum(cntBit, p)
                    let need = v - sumAfterP
                    let take = (need + p - 1) / p
                    println(cntAfterP + take)
                }
            }
        } else {
            let v = Int64.parse(toks[1])
            if (v <= 0) {
                println(0)
            } else {
                let qpos = findPos(v)
                var ans = bitSum(cntBit, qpos)
                if (qpos < MAXV) {
                    let rem = v - bitSum(sumBit, qpos)
                    let atNext = bitSum(cntBit, qpos + 1) - bitSum(cntBit, qpos)
                    let extra = if (rem / (qpos + 1) < atNext) { rem / (qpos + 1) } else { atNext }
                    ans += extra
                }
                println(ans)
            }
        }
    }
    return 0
}
```

要点：

- 树状数组的下标就是值本身（值域 $\le 5 \times 10^6$），不需要离散化。
- `findPos` 用倍增在 `sumBit` 上找「前缀和 $\le x$ 的最大位置」，每个位置值等于下标，取整计算 $\lceil need/p \rceil$ 即可。
- `v = 0` 时两类询问答案都是 $0$，要先特判，避免后续负数计算。
