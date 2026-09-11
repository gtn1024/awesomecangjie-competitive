---
oj: dmy
pid: '41'
title: '[R7E] 小球碰撞'
difficulty: 普及
tags:
  - 排序
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le m \le 10^5$，$1 \le t \le 10^{18}$，$0 \le a_i, b_i \le 10^{18}$。

## 思路

两球碰撞瞬间交换方向，等价于两球「穿过对方继续按原方向前进、只是交换了编号」——也就是说无论怎么碰撞，小球的相对顺序始终保持不变。墙壁也是同理：球碰到墙反弹，等价于「穿过墙继续按原方向、之后再穿回来」。所以可以丢掉碰撞细节，对每个球独立计算 $t$ 秒后的位置，最后再把最终位置排序、按初始排名分配回编号。

排序小球得到每个编号的排名（初始排名第 $k$ 的球，最终也占最终位置里第 $k$ 小的）。对每个球单独算：

- 若左右都没有墙，直接 $p + d \cdot t$。
- 若只有一侧有墙，先算到墙的距离，超过的部分反向移动即可。
- 若左右都有墙（位置 $L, R$），从第一次撞墙开始，每过 $2(R-L)$ 秒回到同一位置，即一个周期。先用撞墙时间扣掉，再对剩余时间模 $2(R-L)$ 跳过完整周期，最后补上不足一个周期的移动。

所有计算是 $O(1)$ 的，瓶颈在排序。

复杂度：时间 $O(n \log n + m \log m)$，空间 $O(n + m)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

func finalPos(p: Int64, d: Int64, t: Int64, L: Int64, R: Int64): Int64 {
    if (L == -1 && R == -1) {
        return p + d * t
    }
    if (L == -1) {
        if (d == 1) {
            let c = R - p
            if (t < c) {
                return p + t
            }
            return R - (t - c)
        }
        return p - t
    }
    if (R == -1) {
        if (d == -1) {
            let c = p - L
            if (t < c) {
                return p - t
            }
            return L + (t - c)
        }
        return p + t
    }
    let P = 2 * (R - L)
    if (d == 1) {
        let c = R - p
        if (t < c) {
            return p + t
        }
        let t2 = (t - c) % P
        if (t2 <= R - L) {
            return R - t2
        }
        return L + (t2 - (R - L))
    }
    let c = p - L
    if (t < c) {
        return p - t
    }
    let t2 = (t - c) % P
    if (t2 <= R - L) {
        return L + t2
    }
    R - (t2 - (R - L))
}

main() {
    let reader = getStdIn()
    let l1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = l1[0]
    let m = l1[1]
    let t = l1[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let d = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let walls = if (m > 0) {
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    } else {
        Array<Int64>(0, { _ => 0 })
    }
    sort(walls)
    let order = Array<Int64>(n, { i => i })
    sort(order, key: { i => a[i] })
    let rank = Array<Int64>(n, { _ => 0 })
    for (j in 0..n) {
        rank[order[j]] = j
    }
    let pos = Array<Int64>(n, { _ => 0 })
    var li: Int64 = -1
    var ri: Int64 = 0
    for (j in 0..n) {
        let id = order[j]
        let p = a[id]
        while (ri < m && walls[ri] < p) {
            li = ri
            ri += 1
        }
        let L = if (li >= 0) { walls[li] } else { -1 }
        let R = if (ri < m) { walls[ri] } else { -1 }
        pos[j] = finalPos(p, d[id], t, L, R)
    }
    sort(pos)
    for (i in 0..n) {
        if (i > 0) {
            print(" ")
        }
        print(pos[rank[i]])
    }
    println()
}
```

要点：

- 碰撞等价于交换编号、墙壁等价于周期反弹，是本题的核心观察，据此把多体问题拆成独立的单体问题。
- $t$ 高达 $10^{18}$，对左右都有墙的情况必须用周期取模，不能逐步模拟。
